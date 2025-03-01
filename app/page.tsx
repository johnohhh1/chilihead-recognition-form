'use client';

import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';

const backgrounds = [
  '/atl_newgrn.jpg',
  '/atl_newblu.jpg',
  '/atl_newred.jpg',
  '/atl_newyllo.jpg'
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

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      const filename = `ATL_Recognition_${new Date().toLocaleDateString('en-US').replace(/\//g, '-')}_${new Date().getTime()}.jpg`;

       const response = await fetch('/api/upload', {
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
        throw new Error('Upload failed');
      }

      alert('Recognition form submitted successfully!');

    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting form: ' + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 bg-gray-50">
      <div 
        id="capture-area" 
        className="relative w-[1100px] h-[850px] bg-cover bg-center p-0 overflow-hidden"
        style={{ backgroundImage: `url(${backgrounds[backgroundIndex]})` }}
      >
        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="absolute inset-0 flex flex-col justify-between p-4">
          {/* Recipient Name */}
          <div className="absolute top-[205px] left-[100px] w-[500px]">
            <label className="block text-lg font-bold text-gray-700">CHEERS TO YOU,</label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
              className="w-full px-3 py-4 border-2 border-[#E31837] rounded text-lg leading-tight"
              required
            />
          </div>

          {/* Checkboxes (4 above the message) */}
          <div className="absolute top-[295px] left-[100px] grid grid-cols-4 gap-4 text-black text-sm">
            {[['guestCounts', 'EVERY GUEST/VIBE COUNTS'], ['playRestaurant', 'PLAY RESTAURANT'],
              ['foodDrink', 'FOOD & DRINK PERFECTION'], ['accountable', 'BE ACCOUNTABLE']].map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.checkboxes[key as keyof typeof formData.checkboxes]}
                  onChange={(e) => setFormData({
                    ...formData,
                    checkboxes: {...formData.checkboxes, [key]: e.target.checked}
                  })}
                  className="w-5 h-5"
                />
                <label className="text-xs font-bold">{label}</label>
              </div>
            ))}
          </div>

          {/* Recognition Message */}
          <div className="absolute top-[320px] left-[100px] w-[900px]">
            <label className="block text-md font-bold text-gray-700">Recognition Message:</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full h-52 px-3 py-4 border-2 border-[#E31837] rounded text-lg leading-tight"
              required
            />
          </div>

          {/* Checkboxes (4 below the message) */}
          <div className="absolute top-[620px] left-[100px] grid grid-cols-4 gap-4 text-black text-sm">
            {[['engageTeam', 'ENGAGE TEAM MEMBERS'], ['bringBack', 'BRING BACK GUESTS'],
              ['growSales', 'GROW SALES'], ['increaseProfits', 'INCREASE PROFITS']].map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.checkboxes[key as keyof typeof formData.checkboxes]}
                  onChange={(e) => setFormData({
                    ...formData,
                    checkboxes: {...formData.checkboxes, [key]: e.target.checked}
                  })}
                  className="w-5 h-5"
                />
                <label className="text-xs font-bold">{label}</label>
              </div>
            ))}
          </div>

          {/* Signature and Date */}
          <div className="absolute top-[680px] left-[100px] grid grid-cols-2 gap-80 text-sm">
            <div>
              <label className="block text-lg font-bold text-gray-700">WITH #CHILISLOVE,</label>
              <input
                type="text"
                value={formData.signature}
                onChange={(e) => setFormData({...formData, signature: e.target.value})}
                className="w-full px-3 py-2 border-2 border-[#E31837] rounded text-lg leading-tight"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700">DATE</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border-2 border-[#E31837] rounded text-lg leading-tight"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="absolute bottom-[30px] left-[100px] w-[900px] bg-red-600 text-white py-3 rounded font-bold hover:bg-red-700 transition-colors text-md"
          >
            Submit Recognition
          </button>
        </form>
      </div>
    </div>
  );
}
