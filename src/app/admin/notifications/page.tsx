'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Users,
  Smartphone,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Flame,
  Clock,
  Gift,
  RefreshCw
} from 'lucide-react';
import { notificationsApi } from '@/services/api/notifications.api';
import { toast } from 'sonner';

interface Template {
  name: string;
  badge: string;
  title: string;
  message: string;
  url: string;
}

const TEMPLATES: Template[] = [
  {
    name: 'Are you hungry? @ ₹99',
    badge: '🔥 Most Popular',
    title: 'Are you hungry? 😋 Order Now at just ₹99!',
    message: 'Ghar jaisa swadist khana ready hai! Order hot & fresh homemade thali right now on Tommalu.',
    url: '/homemade'
  },
  {
    name: 'Lunch Time Craving',
    badge: '🍛 Lunch',
    title: 'Lunch is Served! 🍲 Order by 2:00 PM',
    message: 'Warm ghee rotis, delicious dal, seasonal sabji & fresh salad. Delivered in 30 mins!',
    url: '/homemade'
  },
  {
    name: 'Dinner Special',
    badge: '🌙 Dinner',
    title: 'Ghar Ka Garma-Garam Dinner 🌙',
    message: 'Relax after a long day with homestyle dinner thali delivered straight to your door/hostel.',
    url: '/homemade'
  },
  {
    name: 'Desi Ghee Thali Offer',
    badge: '✨ Special',
    title: 'Craving Pure Desi Khana? 🍽️',
    message: 'Try our Desi Special Thali with Boondi Raita & Lahsun Chutney. Pure taste, 100% hygiene.',
    url: '/homemade'
  },
  {
    name: 'Special Discount Code',
    badge: '🎁 Discount',
    title: 'Exclusive ₹50 Flat Discount! 🎁',
    message: 'Hungry? Use coupon code TOMMALU50 and enjoy ₹50 off on your fresh thali order today!',
    url: '/homemade'
  }
];

export default function AdminPushNotificationsPage() {
  const [title, setTitle] = useState(TEMPLATES[0].title);
  const [message, setMessage] = useState(TEMPLATES[0].message);
  const [url, setUrl] = useState(TEMPLATES[0].url);
  const [targetRole, setTargetRole] = useState<'customer' | 'all' | 'storeOwner'>('customer');

  const [isSending, setIsSending] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    usersWithPush: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const res = await notificationsApi.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (e) {
      // fallback
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleApplyTemplate = (tpl: Template) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setUrl(tpl.url);
    toast.info(`Applied template: "${tpl.name}"`);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Please enter both title and message');
      return;
    }

    try {
      setIsSending(true);
      setLastResult(null);

      const res = await notificationsApi.broadcast({
        title,
        message,
        url: url.trim() || '/homemade',
        targetRole
      });

      if (res.success) {
        setLastResult(res.data);
        toast.success(res.message || 'Push notification broadcasted successfully!');
        try {
          const audio = new Audio('/notification-ring.wav');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch (e) {}
        fetchStats();
      } else {
        toast.error(res.message || 'Failed to dispatch broadcast');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error broadcasting notification';
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setTitle(prev => prev + ' ' + emoji);
  };

  return (
    <div className='p-4 md:p-8 max-w-7xl mx-auto space-y-8'>
      {/* Page Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6'>
        <div>
          <div className='flex items-center gap-2.5'>
            <div className='w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shadow-xs'>
              <Bell className='w-5 h-5' />
            </div>
            <div>
              <h1 className='text-2xl font-black text-stone-900 tracking-tight'>
                Push Notification Hub
              </h1>
              <p className='text-xs text-stone-500 font-medium'>
                Send engaging Swiggy & Zomato style push alerts directly to customer notification bells & devices
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchStats}
          disabled={isLoadingStats}
          className='flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer self-start md:self-auto'>
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* Audience Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <div className='bg-gradient-to-br from-orange-50 to-amber-50/40 p-5 rounded-2xl border border-orange-200/60 shadow-xs'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold text-orange-950 uppercase tracking-wider'>Target Customers</span>
            <div className='w-8 h-8 rounded-xl bg-orange-200/60 text-orange-800 flex items-center justify-center'>
              <Users className='w-4 h-4' />
            </div>
          </div>
          <p className='text-3xl font-black text-orange-950 mt-2'>{stats.totalCustomers || stats.totalUsers || '0'}</p>
          <p className='text-[11px] text-orange-800/80 font-medium mt-1'>Registered inboxes that will receive the notification bell record</p>
        </div>

        <div className='bg-gradient-to-br from-emerald-50 to-teal-50/40 p-5 rounded-2xl border border-emerald-200/60 shadow-xs'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold text-emerald-950 uppercase tracking-wider'>Active Push Subscribers</span>
            <div className='w-8 h-8 rounded-xl bg-emerald-200/60 text-emerald-800 flex items-center justify-center'>
              <Smartphone className='w-4 h-4' />
            </div>
          </div>
          <p className='text-3xl font-black text-emerald-950 mt-2'>{stats.usersWithPush || '0'}</p>
          <p className='text-[11px] text-emerald-800/80 font-medium mt-1'>Devices with registered FCM push tokens for instant mobile alerts</p>
        </div>

        <div className='bg-gradient-to-br from-amber-50 to-yellow-50/40 p-5 rounded-2xl border border-amber-200/60 shadow-xs'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold text-amber-950 uppercase tracking-wider'>Instant Delivery</span>
            <div className='w-8 h-8 rounded-xl bg-amber-200/60 text-amber-800 flex items-center justify-center'>
              <Sparkles className='w-4 h-4' />
            </div>
          </div>
          <p className='text-3xl font-black text-amber-950 mt-2'>Realtime</p>
          <p className='text-[11px] text-amber-800/80 font-medium mt-1'>Web browsers on site get instant audio chime & on-screen toast</p>
        </div>
      </div>

      {/* 1-Click Swiggy / Zomato Preset Templates */}
      <div>
        <div className='flex items-center gap-2 mb-3'>
          <Flame className='w-4 h-4 text-orange-600' />
          <h2 className='text-sm font-black text-stone-900'>1-Click Swiggy / Zomato Templates</h2>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
          {TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              type='button'
              onClick={() => handleApplyTemplate(tpl)}
              className='text-left p-3.5 rounded-2xl border border-stone-200/90 bg-white hover:border-orange-500 hover:shadow-md transition-all group cursor-pointer relative'>
              <div className='flex items-center justify-between mb-1.5'>
                <span className='text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md'>
                  {tpl.badge}
                </span>
                <span className='text-xs font-bold text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity'>
                  Apply ➔
                </span>
              </div>
              <h4 className='text-xs font-black text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1'>
                {tpl.title}
              </h4>
              <p className='text-[11px] text-stone-500 line-clamp-2 mt-1 leading-snug'>
                {tpl.message}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Composer & Mobile Mockup Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
        {/* Left: Compose Form */}
        <div className='lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm'>
          <h3 className='text-base font-black text-stone-900 mb-4 flex items-center gap-2'>
            <Send className='w-4 h-4 text-orange-600' /> Compose Notification
          </h3>

          <form onSubmit={handleSendBroadcast} className='space-y-5'>
            {/* Target Audience */}
            <div>
              <label className='block text-xs font-black text-stone-700 uppercase tracking-wider mb-1.5'>
                Target Audience
              </label>
              <select
                value={targetRole}
                onChange={(e: any) => setTargetRole(e.target.value)}
                className='w-full px-3.5 py-2.5 rounded-xl border border-stone-200 font-semibold text-xs text-stone-800 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500'>
                <option value='customer'>All Customers (Recommended)</option>
                <option value='all'>Everyone (Customers + Store Owners + Staff)</option>
                <option value='storeOwner'>Kitchen & Store Owners Only</option>
              </select>
            </div>

            {/* Title with Emoji Shortcuts */}
            <div>
              <div className='flex items-center justify-between mb-1.5'>
                <label className='block text-xs font-black text-stone-700 uppercase tracking-wider'>
                  Notification Title
                </label>
                <div className='flex items-center gap-1'>
                  {['😋', '🍛', '🔔', '🌙', '🎁', '🛵'].map((em, idx) => (
                    <button
                      key={idx}
                      type='button'
                      onClick={() => addEmoji(em)}
                      className='text-xs p-1 hover:bg-stone-100 rounded cursor-pointer'>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type='text'
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder='e.g., Are you hungry? 😋 Order Now at just ₹99!'
                maxLength={80}
                required
                className='w-full px-3.5 py-2.5 rounded-xl border border-stone-200 font-bold text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500'
              />
              <span className='text-[10px] text-stone-400 block text-right mt-1'>{title.length}/80</span>
            </div>

            {/* Message Body */}
            <div>
              <label className='block text-xs font-black text-stone-700 uppercase tracking-wider mb-1.5'>
                Notification Message Body
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder='e.g., Delicious homestyle Thali is ready! Order now for just ₹99 with lightning delivery.'
                rows={3}
                maxLength={200}
                required
                className='w-full px-3.5 py-2.5 rounded-xl border border-stone-200 font-medium text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 leading-relaxed'
              />
              <span className='text-[10px] text-stone-400 block text-right mt-1'>{message.length}/200</span>
            </div>

            {/* Action / Click URL */}
            <div>
              <label className='block text-xs font-black text-stone-700 uppercase tracking-wider mb-1.5'>
                Action Link (When Clicked)
              </label>
              <div className='relative'>
                <input
                  type='text'
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder='/homemade'
                  className='w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-200 font-semibold text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500'
                />
                <ExternalLink className='w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none' />
              </div>
              <p className='text-[10px] text-stone-400 mt-1'>
                Default is <code>/homemade</code> (opens the ₹99 thali page). Use <code>/customer/orders</code> for order page.
              </p>
            </div>

            {/* Send Button */}
            <div className='pt-3'>
              <button
                type='submit'
                disabled={isSending}
                className='w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50'>
                {isSending ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    Broadcasting to Customers...
                  </>
                ) : (
                  <>
                    <Send className='w-4 h-4' /> Broadcast Push Notification 🚀
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Success Banner if sent */}
          {lastResult && (
            <div className='mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3 animate-in fade-in'>
              <CheckCircle2 className='w-5 h-5 text-emerald-600 shrink-0 mt-0.5' />
              <div className='text-xs'>
                <h5 className='font-black text-emerald-900'>Notification Sent Successfully!</h5>
                <p className='mt-0.5 text-emerald-800'>
                  Dispatched to <strong>{lastResult.targetedUsers}</strong> customer notification bell inboxes.
                  Mobile/desktop push delivered to <strong>{lastResult.pushDelivered}</strong> active devices.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Mobile Lockscreen / Notification Preview */}
        <div className='lg:col-span-5 bg-gradient-to-b from-stone-900 to-stone-950 rounded-[40px] p-6 text-white shadow-2xl border-4 border-stone-800 relative overflow-hidden'>
          <div className='flex items-center justify-between text-xs text-stone-400 font-bold mb-6 px-1'>
            <span>12:45</span>
            <div className='flex items-center gap-1.5'>
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          <div className='text-center my-6'>
            <h4 className='text-[11px] font-bold tracking-widest uppercase text-stone-400'>Live Mobile Preview</h4>
            <p className='text-[10px] text-stone-500'>How this notification will appear on the customer's phone</p>
          </div>

          {/* Swiggy / Zomato style Notification Card */}
          <div className='bg-white/95 backdrop-blur-md rounded-2xl p-4 text-stone-900 shadow-xl border border-white/40 transform transition-transform hover:scale-[1.02]'>
            <div className='flex items-center justify-between text-[11px] font-bold text-stone-500 mb-1.5'>
              <div className='flex items-center gap-1.5'>
                <div className='w-4 h-4 rounded bg-orange-600 text-white flex items-center justify-center text-[9px] font-black'>
                  T
                </div>
                <span className='font-black text-stone-900 tracking-wide'>TOMMALU</span>
                <span>•</span>
                <span>Now</span>
              </div>
              <span className='text-[10px] text-orange-600 font-extrabold'>Swiggy/Zomato style</span>
            </div>

            <h5 className='font-black text-xs text-stone-950 leading-snug'>
              {title || 'Are you hungry? 😋 Order Now at just ₹99!'}
            </h5>
            <p className='text-xs text-stone-600 mt-1 leading-relaxed line-clamp-3 font-medium'>
              {message || 'Ghar jaisa swadist khana ready hai! Order hot & fresh homemade thali right now on Tommalu.'}
            </p>

            <div className='mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-bold text-orange-600'>
              <span>Tap to order 🍛</span>
              <span className='text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-black'>
                ₹99 THALI
              </span>
            </div>
          </div>

          {/* Customer Notification Bell List Mockup */}
          <div className='mt-8 pt-6 border-t border-stone-800'>
            <div className='flex items-center justify-between text-xs text-stone-400 mb-3 font-bold'>
              <span>Customer In-App Bell Preview</span>
              <Bell className='w-3.5 h-3.5 text-orange-400' />
            </div>

            <div className='bg-stone-800/80 rounded-2xl p-3 border border-stone-700/60 flex items-start gap-3'>
              <div className='w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-base shrink-0'>
                🍛
              </div>
              <div className='min-w-0 flex-1'>
                <h6 className='text-xs font-black text-white line-clamp-1'>
                  {title || 'Are you hungry? 😋'}
                </h6>
                <p className='text-[11px] text-stone-300 mt-0.5 line-clamp-2 leading-tight'>
                  {message}
                </p>
                <span className='text-[9px] text-stone-500 block mt-1'>Just now • Unread</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
