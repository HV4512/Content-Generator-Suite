import React, { useState } from 'react';
import { Send, FileText, MessageSquare, Mail, Zap, BarChart3, Copy, Download } from 'lucide-react';

const ContentGenerator = () => {
  const [formData, setFormData] = useState({
    contentType: 'blog',
    topic: '',
    tone: 'professional',
    audience: '',
    keywords: ''
  });
  
  const [generatedContent, setGeneratedContent] = useState('');
  const [seoScore, setSeoScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const BASE_URL = import.meta.env.VITE_BASE_URL;


  console.log('BASE_URL:', BASE_URL); // Debug log to check BASE_URL
  // API CALL with improved error handling
  const generateContent = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log

      // Handle different possible response formats
      if (typeof data === 'string') {
        setGeneratedContent(data);
        setSeoScore(null);
      } else if (data.content) {
        setGeneratedContent(data.content);
        setSeoScore(data.analysis || null);
      } else if (data.text) {
        setGeneratedContent(data.text);
        setSeoScore(data.seo || data.analysis || null);
      } else {
        // If response format is unexpected, stringify it
        setGeneratedContent(JSON.stringify(data, null, 2));
        setSeoScore(null);
      }

    } catch (error) {
      console.error('Error:', error);
      setError(`Failed to generate content: ${error.message}`);
      setGeneratedContent('');
      setSeoScore(null);
    }
    
    setLoading(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadContent = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${formData.contentType}-${formData.topic.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Content Generation Suite</h1>
          <p className="text-gray-600">Create professional content for blogs, social media, and emails</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                Content Settings
              </h2>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Content Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'blog', icon: FileText, label: 'Blog' },
                    { value: 'social', icon: MessageSquare, label: 'Social' },
                    { value: 'email', icon: Mail, label: 'Email' }
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => setFormData({...formData, contentType: value})}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        formData.contentType === value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  placeholder="e.g., AI in healthcare, Digital marketing trends"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tone */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({...formData, tone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="authoritative">Authoritative</option>
                  <option value="conversational">Conversational</option>
                </select>
              </div>

              {/* Target Audience */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <input
                  type="text"
                  value={formData.audience}
                  onChange={(e) => setFormData({...formData, audience: e.target.value})}
                  placeholder="e.g., Small business owners, Tech professionals"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Keywords */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (for SEO)</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                  placeholder="e.g., artificial intelligence, machine learning"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={generateContent}
                disabled={loading || !formData.topic.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {loading ? 'Generating...' : 'Generate Content'}
              </button>
            </div>
          </div>

          {/* Generated Content & Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Generated Content */}
            {generatedContent && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-500" />
                    Generated Content
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={downloadContent}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Download content"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Generated content will appear here..."
                />
              </div>
            )}

            {/* SEO Analysis */}
            {seoScore && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  SEO Analysis
                </h2>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{seoScore.wordCount || 0}</div>
                    <div className="text-sm text-gray-600">Words</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{seoScore.readability || 'N/A'}</div>
                    <div className="text-sm text-gray-600">Readability</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{seoScore.keywordDensity || 0}%</div>
                    <div className="text-sm text-gray-600">Keyword Density</div>
                  </div>
                </div>

                {seoScore.suggestions && seoScore.suggestions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Suggestions:</h3>
                    <ul className="space-y-1">
                      {seoScore.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Placeholder for when no content is generated */}
            {!generatedContent && !loading && (
              <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No content generated yet</h3>
                <p className="text-gray-400">Fill in the form and click "Generate Content" to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentGenerator;