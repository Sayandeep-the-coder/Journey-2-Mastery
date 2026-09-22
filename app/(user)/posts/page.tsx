'use client';

import { useState } from 'react';
import { usePosts } from '@/hooks/queries/usePosts';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import PosterCard from '@/components/shared/PosterCard';
import { Newspaper, Search, ChevronDown, Calendar, ChevronRight, Swords, Scroll, Landmark, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Post } from '@/types/api.types';

function NinjaStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12 1.5 13.5 8 17 10C19.5 11.5 22.5 12 22.5 12C22.5 12 19.5 12.5 17 14C13.5 16 12 22.5 12 22.5C12 22.5 10.5 16 7 14C4.5 12.5 1.5 12 1.5 12C1.5 12 4.5 11.5 7 10C10.5 8 12 1.5 12 1.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    </svg>
  );
}

const TABS = ['All Posts', 'Announcements', 'Updates', 'Events', 'Resources'];

export default function PostsPage() {
  const { data: posts, isLoading, isError, error, refetch } = usePosts();
  const [activeTab, setActiveTab] = useState('All Posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  if (isLoading) return <LoadingSkeleton variant="card-grid" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const isFiltering = searchQuery.trim().length > 0 || activeTab !== 'All Posts';

  const filteredPosts = posts?.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Fallback category matching since API doesn't have a category field
    const matchesTab = activeTab === 'All Posts' ? true : (
      post.title.toLowerCase().includes(activeTab.toLowerCase()) || 
      post.description.toLowerCase().includes(activeTab.toLowerCase())
    );
    
    return matchesSearch && matchesTab;
  }) || [];

  // Base arrays for default view
  const carouselPosts = posts && posts.length > 0 ? posts.slice(0, 3) : [];
  const featuredPost = carouselPosts[currentFeaturedIndex] || carouselPosts[0];
  const latestUpdates = posts && posts.length > 0 ? posts.slice(0, 5) : []; // Show the top 5 recent posts in the Notice Box
  const gridPosts = posts && posts.length > 5 ? posts.slice(5) : [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-card-bg border border-borders px-8 py-12 md:py-16 shadow-sm">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent)' }}>
          <Image src="/images/dashboard-header.png" alt="Landscape" fill className="object-cover mix-blend-multiply grayscale contrast-125 brightness-110" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-text drop-shadow-sm flex items-center gap-3">
              <NinjaStarIcon className="h-10 w-10 text-japan-red" />
              Community Noticeboard
            </h1>
            <p className="text-secondary-text mt-4 font-medium text-lg">Hear the latest proclamations and updates from the masters.</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div id="all-posts" className="bg-white rounded-2xl border border-borders p-3 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mt-4 shadow-sm">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                activeTab === tab 
                  ? "bg-japan-red text-white shadow-md"
                  : "text-secondary-text bg-off-white hover:bg-borders/40 hover:text-primary-text"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text" />
            <input
              type="text"
              placeholder="Search posts and announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-off-white border border-borders rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-japan-red/20 focus:border-japan-red transition-colors"
            />
          </div>
        </div>
      </div>

      {!posts || posts.length === 0 ? (
        <EmptyState icon="file" title="No announcements yet" message="The village is quiet. Check back later for news." />
      ) : (
        <>
          {isFiltering ? (
            /* Search Results View */
            <div className="mt-8">
              {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-fade max-w-7xl mx-auto">
                  {filteredPosts.map((post) => (
                    <div key={post.id} className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-japan-red to-[#D4AF37] rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                      <PosterCard post={post} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center flex flex-col items-center justify-center text-secondary-text bg-white border border-borders rounded-2xl shadow-sm">
                  <Search className="h-10 w-10 text-borders mb-4" />
                  <h3 className="text-lg font-bold text-primary-text mb-2">No posts found</h3>
                  <p>We couldn't find any notices matching your search criteria.</p>
                </div>
              )}
            </div>
          ) : (
            /* Default Layout View (Not searching) */
            <div className="space-y-10 mt-8">
              {/* Top Section: Featured + Latest Updates */}
              <div className="flex flex-col xl:flex-row gap-6">
                
                {/* Featured Post Carousel */}
                {featuredPost && (
                  <div className="xl:w-2/3 flex flex-col">
                    <Link href={`/posts/${featuredPost.id}`} className="group flex-1 flex flex-col md:flex-row rounded-2xl border border-borders bg-[#F5F2EB] overflow-hidden relative transition-all duration-300 hover:shadow-md">
                      <div className="md:w-1/2 relative min-h-[250px] md:min-h-[300px]">
                        {featuredPost.posterImageUrl ? (
                          <img src={featuredPost.posterImageUrl} alt="Featured" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-japan-red/10 to-transparent flex items-center justify-center">
                            <Star className="h-24 w-24 text-japan-red/20 group-hover:scale-110 transition-transform duration-500" />
                          </div>
                        )}
                      </div>
                      <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center bg-[url('/images/paper-texture.png')] bg-cover relative">
                        <div className="text-japan-red font-bold text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-japan-red animate-pulse"></span>
                          Featured Notice
                        </div>
                        <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary-text mb-4 md:mb-6 group-hover:text-japan-red transition-colors line-clamp-2 leading-tight">
                          {featuredPost.title}
                        </h2>
                        <p className="text-secondary-text mb-6 line-clamp-3 leading-relaxed text-sm md:text-base">
                          {featuredPost.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-secondary-text mt-auto font-medium">
                          <Calendar className="h-4 w-4 text-japan-red" />
                          {new Date(featuredPost.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </Link>
                    
                    {/* Carousel Dots */}
                    {carouselPosts.length > 0 && (
                      <div className="flex items-center justify-center gap-2 mt-4 min-h-[12px]">
                        {carouselPosts.map((_, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setCurrentFeaturedIndex(idx)}
                            className={cn(
                              "h-2 rounded-full transition-all duration-300",
                              currentFeaturedIndex === idx ? "bg-japan-red w-6" : "bg-borders hover:bg-borders/80 w-2"
                            )}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Notice Box */}
                <div className="xl:w-1/3 rounded-2xl border border-borders bg-white p-6 flex flex-col shadow-sm">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-borders/50">
                    <div className="w-8 h-8 rounded-full bg-japan-red/10 flex items-center justify-center">
                      <Scroll className="w-4 h-4 text-japan-red" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-primary-text">
                      Notice Box
                    </h3>
                  </div>
                  
                  {latestUpdates.length > 0 ? (
                    <div className="flex flex-col gap-1 flex-1">
                      {latestUpdates.map((update, i) => {
                        return (
                          <Link key={update.id} href={`/posts/${update.id}`} className="group flex items-center gap-2 py-2.5 border-b border-borders/40 last:border-0 relative overflow-hidden transition-all duration-300">
                            {/* Animated left indicator */}
                            <div className="absolute left-0 top-0 bottom-0 w-0 bg-japan-red transition-all duration-300 group-hover:w-1 rounded-r-md opacity-0 group-hover:opacity-100" />
                            
                            <h4 className="font-semibold text-primary-text text-sm truncate group-hover:text-japan-red transition-colors group-hover:translate-x-2 duration-300 flex-1 pl-1">
                              {update.title}
                            </h4>
                            
                            <ChevronRight className="w-4 h-4 text-borders group-hover:text-japan-red opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-50">
                      <Scroll className="w-10 h-10 text-muted-text mb-3" />
                      <p className="text-sm font-medium text-secondary-text">No additional notices</p>
                    </div>
                  )}

                  {gridPosts.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-borders/50">
                      <button onClick={() => document.getElementById('grid-posts')?.scrollIntoView({ behavior: 'smooth' })} className="w-full py-2.5 rounded-lg border border-borders text-secondary-text font-medium text-sm hover:bg-off-white hover:text-primary-text transition-colors flex items-center justify-center gap-2">
                        View All Notices
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid Posts */}
              {gridPosts.length > 0 && (
                <div id="grid-posts" className="pt-8 border-t border-borders/50">
                  <div className="flex items-center gap-3 mb-8">
                    <h3 className="font-serif text-2xl font-bold text-primary-text">Previous Notices</h3>
                    <div className="h-px flex-1 bg-borders/50"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-fade max-w-7xl mx-auto">
                    {gridPosts.map((post) => (
                      <div key={post.id} className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-japan-red to-[#D4AF37] rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                        <PosterCard post={post} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
