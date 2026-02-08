import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, createPost } from '../../features/posts/postsSlice';
import PostCard from '../../components/PostCard';
import { Loader2, Send, Image as ImageIcon, Link as LinkIcon, X, Trophy, Briefcase, HelpCircle, Layers } from 'lucide-react';

const FeedPage = () => {
  const dispatch = useDispatch();
  const { posts, loading, error } = useSelector((state) => state.posts);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [postType, setPostType] = useState('general'); // general, achievement, vacancy, question

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
        dispatch(createPost({ 
            content, 
            image: imageUrl, 
            type: postType,
            tags: postType === 'general' ? [] : [postType.charAt(0).toUpperCase() + postType.slice(1)]
        }));
        setContent('');
        setImageUrl('');
        setShowImageInput(false);
        setPostType('general'); // Reset
    }
  };

  const filteredPosts = posts.filter(post => {
      if (activeTab === 'all') return true;
      if (activeTab === 'achievements') return post.tags?.some(t => t.toLowerCase().includes('achievement')) || post.title?.toLowerCase().includes('success');
      if (activeTab === 'opportunities') return post.tags?.some(t => t.toLowerCase().includes('vacancy') || t.toLowerCase().includes('internship') || t.toLowerCase().includes('job'));
      if (activeTab === 'questions') return post.tags?.some(t => t.toLowerCase().includes('question') || t.toLowerCase().includes('help'));
      return true;
  });

  const TabButton = ({ id, label, icon: Icon }) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === id 
            ? 'bg-slate-800 text-white shadow-lg shadow-slate-900/10' 
            : 'text-slate-500 hover:bg-white hover:text-amber-600'
        }`}
      >
          <Icon size={16} />
          <span>{label}</span>
      </button>
  );

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 md:px-0">
      
      {/* Tabs */}
      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 custom-scrollbar">
          <TabButton id="all" label="All Posts" icon={Layers} />
          <TabButton id="achievements" label="Achievements" icon={Trophy} />
          <TabButton id="opportunities" label="Opportunities" icon={Briefcase} />
          <TabButton id="questions" label="Questions" icon={HelpCircle} />
      </div>

      {/* Create Post Widget */}
      <div className="glass-panel rounded-2xl p-6 mb-8 transform hover:scale-[1.01] transition-all duration-300 border border-white/60 shadow-xl shadow-amber-900/5 bg-white/70 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500"></div>
        <div className="flex items-start space-x-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex-shrink-0 shadow-lg border-2 border-white flex items-center justify-center text-white font-serif font-bold text-xl">
                 S
            </div>
            <form onSubmit={handlePostSubmit} className="flex-1">
                <textarea 
                    className="w-full bg-white/50 border border-amber-900/10 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none p-4 text-slate-700 placeholder-slate-400 transition-all shadow-inner text-sm font-medium"
                    rows={showImageInput ? 2 : 3}
                    placeholder={`What's on your mind? Share an ${activeTab === 'all' ? 'update' : activeTab.slice(0, -1)}...`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                ></textarea>

                {/* Post Type Selector */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {['general', 'achievement', 'vacancy', 'question'].map(type => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setPostType(type)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors capitalize ${
                                postType === type 
                                ? 'bg-amber-100 text-amber-800 border-amber-200' 
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-amber-200'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Hidden File Input */}
                <input 
                    type="file" 
                    id="imageInput" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                setImageUrl(reader.result);
                                setShowImageInput(true);
                            };
                            reader.readAsDataURL(file);
                        }
                    }}
                />

                {showImageInput && imageUrl && (
                    <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200 group/preview">
                        <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover" />
                         <button 
                            type="button"
                            onClick={() => { setShowImageInput(false); setImageUrl(''); }}
                            className="absolute right-2 top-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}
                
                <div className="flex justify-between items-center mt-4 border-t border-slate-100/50 pt-3">
                    <div className="flex space-x-2">
                        <button 
                            type="button" 
                            onClick={() => document.getElementById('imageInput').click()}
                            className={`p-2 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors ${imageUrl ? 'bg-amber-50 text-amber-600' : ''}`}
                            title="Add Image"
                        >
                            <ImageIcon size={18} />
                        </button>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={!content.trim()}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 hover:shadow-lg hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                    >
                        <span>Post</span>
                        <Send size={14} />
                    </button>
                </div>
            </form>
        </div>
      </div>

      {/* Feed List */}
      {loading && posts.length === 0 ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-amber-500" size={40} /></div>
      ) : (
        <div className="space-y-6">
            {filteredPosts.map(post => (
                <PostCard key={post.id} post={post} />
            ))}
            {filteredPosts.length === 0 && !loading && (
                <div className="text-center py-16 px-6 glass-panel rounded-2xl border border-dashed border-slate-300">
                    <div className="text-slate-400 font-serif italic text-xl mb-2">No posts found in this category.</div>
                    <p className="text-slate-500 text-sm">Be the first to share something!</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default FeedPage;
