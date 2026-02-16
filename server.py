#!/usr/bin/env python3
import http.server
import socketserver
import urllib.request
import urllib.parse
from urllib.error import URLError, HTTPError

class VideoProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/proxy-video/'):
            # Extract the actual URL from the path
            encoded_url = self.path[13:]  # Remove '/proxy-video/' prefix
            video_url = urllib.parse.unquote(encoded_url)
            
            try:
                # Fetch the video
                req = urllib.request.Request(video_url)
                req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
                
                with urllib.request.urlopen(req) as response:
                    self.send_response(200)
                    
                    # Copy headers from the original response
                    content_type = response.headers.get('Content-Type', 'video/mp4')
                    self.send_header('Content-Type', content_type)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
                    self.send_header('Access-Control-Allow-Headers', 'Range')
                    
                    # Handle range requests for video streaming
                    range_header = self.headers.get('Range')
                    if range_header:
                        self.send_header('Accept-Ranges', 'bytes')
                        # For simplicity, just serve the whole file
                        # In production, you'd want to handle byte ranges properly
                    
                    self.end_headers()
                    
                    # Stream the content
                    while True:
                        chunk = response.read(8192)
                        if not chunk:
                            break
                        self.wfile.write(chunk)
                        
            except (URLError, HTTPError) as e:
                self.send_error(500, f"Error fetching video: {e}")
                
        elif self.path.startswith('/proxy-subtitle/'):
            # Handle subtitle proxy
            encoded_url = self.path[15:]  # Remove '/proxy-subtitle/' prefix
            subtitle_url = urllib.parse.unquote(encoded_url)
            
            try:
                req = urllib.request.Request(subtitle_url)
                req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
                
                with urllib.request.urlopen(req) as response:
                    content = response.read().decode('utf-8')
                    
                    # Convert SRT to WebVTT
                    vtt_content = 'WEBVTT\n\n' + content.replace(',', '.')
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'text/vtt')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    
                    self.wfile.write(vtt_content.encode('utf-8'))
                    
            except (URLError, HTTPError) as e:
                self.send_error(500, f"Error fetching subtitle: {e}")
        else:
            # Serve static files normally
            super().do_GET()

if __name__ == "__main__":
    PORT = 8000
    Handler = VideoProxyHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        print("Video proxy: /proxy-video/[encoded_url]")
        print("Subtitle proxy: /proxy-subtitle/[encoded_url]")
        httpd.serve_forever()
