'use client';

import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';

const backgrounds = [
  '/atl_newblu.jpg',
  '/atl_newyllo.jpg',
  '/atl_newred.jpg',
  '/atl_newgrn.jpg'
];

export default function RecognitionForm() {
  const [formData, setFormData] = useState({
    recipientName: '',
    message: '',
    signature: '',
    date: '',
    checkboxes: {
      guestCounts: false,
      playRestaurant: false,
      foodDrink: false,
      accountable: false,
      engageTeam: false,
      bringBack: false,
      growSales: false,
      increaseProfits: false
    }
  });

  const [backgroundIndex, setBackgroundIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    }, 5000); // Change background every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const element = document.getElementById('capture-area');
      if (!element) return;

      // Show loading state
      console.log('Starting image capture...');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff', // White background for JPEG
        logging: false,
        allowTaint: true,
        imageTimeout: 15000
      });

      // Convert to JPEG with compression
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      const filename = `ATL_Recognition_${new Date().toLocaleDateString('en-US').replace(/\//g, '-')}_${new Date().getTime()}.jpg`;

      console.log('Image captured, size:', Math.round(imageData.length / 1024), 'KB');

       const response = await fetch('/api/upload-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          metadata: {
            location: 'Auburn Hills',
            timestamp: new Date().toISOString(),
            filename: filename
          }
        })
      });

      if (!response.ok) {
        // Try to get error details from response
        const errorText = await response.text();
        console.error('Upload failed with status:', response.status, 'Error:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      
      alert('Recognition form submitted successfully!');
      
      // Clear form after successful submission
      setFormData({
        recipientName: '',
        message: '',
        signature: '',
        date: '',
        checkboxes: {
          guestCounts: false,
          playRestaurant: false,
          foodDrink: false,
          accountable: false,
          engageTeam: false,
          bringBack: false,
          growSales: false,
          increaseProfits: false
        }
      });

    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting form: ' + (error as Error).message);
    }
  };

  // Input field styles to prevent text cutoff
  const inputStyle = { 
    paddingTop: '10px', 
    paddingBottom: '14px',
    lineHeight: '28px',
    height: '52px',
    fontSize: '18px'
  };

  const textareaStyle = { 
    paddingTop: '12px', 
    paddingBottom: '14px',
    lineHeight: '30px',
    fontSize: '18px'
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 bg-gray-50">
      <div 
        id="capture-area" 
        className="relative bg-contain bg-no-repeat bg-center"
        style={{ 
          backgroundImage: `url(${backgrounds[backgroundIndex]})`,
          width: '1152px',
          height: '918px'
        }}
      >
        {/* Form Inputs - positioned within the gray form area */}
        <form onSubmit={handleSubmit} className="absolute inset-0">
          
          {/* Recipient Name - positioned in the upper area of the form */}
          <div className="absolute top-[240px] left-[120px] w-[520px]">
            <label className="block text-lg font-bold text-gray-800 mb-2">CHEERS TO YOU,</label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
              className="w-full px-4 border-2 border-[#E31837] rounded-md bg-white"
              style={inputStyle}
              placeholder="Enter recipient's name"
              required
            />
          </div>

          {/* Top Checkboxes - 4 values positioned above message */}
          <div className="absolute top-[340px] left-[120px] right-[120px]">
            <div className="grid grid-cols-4 gap-6">
              {[
                ['guestCounts', 'EVERY GUEST/VIBE COUNTS'],
                ['playRestaurant', 'PLAY RESTAURANT'],
                ['foodDrink', 'FOOD & DRINK PERFECTION'],
                ['accountable', 'BE ACCOUNTABLE']
              ].map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.checkboxes[key as keyof typeof formData.checkboxes]}
                    onChange={(e) => setFormData({
                      ...formData,
                      checkboxes: {...formData.checkboxes, [key]: e.target.checked}
                    })}
                    className="w-5 h-5 accent-[#E31837]"
                  />
                  <label className="text-xs font-bold text-gray-800">{label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Recognition Message - main text area */}
          <div className="absolute top-[390px] left-[120px] right-[120px]">
            <label className="block text-lg font-bold text-gray-800 mb-2">Recognition Message:</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full h-48 px-4 border-2 border-[#E31837] rounded-md resize-none bg-white"
              style={textareaStyle}
              placeholder="Write your recognition message here..."
              required
            />
          </div>

          {/* Bottom Checkboxes - 4 values positioned below message */}
          <div className="absolute top-[640px] left-[120px] right-[120px]">
            <div className="grid grid-cols-4 gap-6">
              {[
                ['engageTeam', 'ENGAGE TEAM MEMBERS'],
                ['bringBack', 'BRING BACK GUESTS'],
                ['growSales', 'GROW SALES'],
                ['increaseProfits', 'INCREASE PROFITS']
              ].map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.checkboxes[key as keyof typeof formData.checkboxes]}
                    onChange={(e) => setFormData({
                      ...formData,
                      checkboxes: {...formData.checkboxes, [key]: e.target.checked}
                    })}
                    className="w-5 h-5 accent-[#E31837]"
                  />
                  <label className="text-xs font-bold text-gray-800">{label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Signature and Date - positioned at bottom of form area */}
          <div className="absolute top-[700px] left-[120px] right-[120px]">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">WITH #CHILISLOVE,</label>
                <input
                  type="text"
                  value={formData.signature}
                  onChange={(e) => setFormData({...formData, signature: e.target.value})}
                  className="w-full px-4 border-2 border-[#E31837] rounded-md bg-white"
                  style={inputStyle}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">DATE</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 border-2 border-[#E31837] rounded-md bg-white"
                  style={inputStyle}
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button - positioned below the form area */}
          <button
            type="submit"
            className="absolute bottom-[40px] left-[120px] right-[120px] bg-[#E31837] text-white py-4 rounded-md font-bold hover:bg-red-700 transition-colors text-lg shadow-lg"
          >
            Submit Recognition
          </button>
        </form>
      </div>
    </div>
  );
}
