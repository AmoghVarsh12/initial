const API_BASE_URL = 'http://localhost:8000/api';

export class VideoProcessingAPI {
  static async processVideo(file: File, method: string): Promise<{ videoBlob: Blob; metadata: any }> {
    console.log('🚀 Starting video processing...');
    console.log('📁 File:', file.name, 'Size:', file.size, 'bytes');
    console.log('🔧 Method:', method);
    
    // Map frontend method names to backend expected values (for methods without sub-methods)
    const methodMapping: { [key: string]: string } = {
      'glare': 'unet',
      'deraining': 'unet',
      'tilt': 'unet',
      'dehazing': 'unet',
      'automatic': 'unet_selective'
    };

    // Use direct method if it's a sub-method (clahe, unet, unet_selective)
    // or map it if it's a main method without sub-methods
    const backendMethod = ['clahe', 'unet', 'unet_selective'].includes(method) 
      ? method 
      : methodMapping[method] || 'clahe';
    
    console.log('🔄 Frontend method:', method, '-> Backend method:', backendMethod);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('method', backendMethod);

    try {
      console.log('📡 Sending request to:', `${API_BASE_URL}/process_video/`);
      const response = await fetch(`${API_BASE_URL}/process_video/`, {
        method: 'POST',
        body: formData,
      });

      console.log('📨 Response status:', response.status);
      console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Processing failed: ${response.status} - ${errorText}`);
      }

      // Check if response is JSON (error) or blob (success)
      const contentType = response.headers.get('content-type');
      console.log('📄 Content type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Processing failed');
      }

      // Check if response includes metadata
      const responseClone = response.clone();
      try {
        const jsonResponse = await responseClone.json();
        if (jsonResponse.video_url && jsonResponse.metadata) {
          // Fetch the actual video file
          const videoResponse = await fetch(jsonResponse.video_url);
          const videoBlob = await videoResponse.blob();
          return { videoBlob, metadata: jsonResponse.metadata };
        }
      } catch {
        // Fallback to blob response
        const blob = await response.blob();
        console.log('✅ Received blob:', blob.size, 'bytes, type:', blob.type);
        return { videoBlob: blob, metadata: null };
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('💥 API Error:', error);
      throw error;
    }
  }

  static async getVideoMetadata(filename: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/video_metadata/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to get metadata: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Metadata API Error:', error);
      return null;
    }
  }

  static async getProcessingStatus(jobId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/status/${jobId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get status: ${response.statusText}`);
    }

    return response.json();
  }
}