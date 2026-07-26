'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCompleteProfile, useSession } from '@/hooks/useSession';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowRight, User, Mail, Phone, Building2, MapPin, GraduationCap, MessageSquare } from 'lucide-react';
import { SplitLayout } from './SplitLayout';

const onboardingSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Please enter a valid phone number').max(20),
  branch: z.string().min(2, 'Department / Branch is required').max(100),
  year: z.string().min(1, 'Please select your current year'),
  collegeName: z.string().min(2, 'College / University name is required').max(200),
  location: z.string().min(2, 'Location is required').max(100),
  bio: z.string().min(10, 'Bio is required (at least 10 characters)').max(500, 'Bio must be under 500 characters'),
  discord: z.string().min(2, 'Discord username is required').max(100),
  instagram: z.string().max(100).optional().or(z.literal('')),
  twitter: z.string().min(2, 'Twitter (X) handle is required').max(100),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const { data: user } = useSession();
  const completeProfile = useCompleteProfile();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(onboardingSchema) as any,
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: '',
      branch: '',
      year: '',
      collegeName: '',
      location: '',
      bio: '',
      discord: '',
      instagram: '',
      twitter: '',
    },
  });

  useEffect(() => {
    if (user?.fullName) setValue('fullName', user.fullName);
    if (user?.email) setValue('email', user.email);
  }, [user, setValue]);

  const onSubmit = (data: OnboardingFormValues) => {
    completeProfile.mutate({
      fullName: data.fullName,
      collegeName: data.collegeName,
      branch: data.branch,
      year: data.year,
      phone: data.phone,
      bio: data.bio,
      discord: data.discord,
      instagram: data.instagram,
      twitter: data.twitter,
    });
  };

  const leftContent = (
    <div>
      {/* Brand Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#B93A32] flex items-center justify-center text-[#F7F3EE]">
          <span className="font-serif font-bold text-lg">J</span>
        </div>
        <span className="font-sans uppercase tracking-[0.2em] text-sm text-[#4A4A4A] font-medium">
          JOURNEY TO MASTERY
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="font-serif text-5xl lg:text-7xl font-semibold leading-[1.1] mb-6 text-[#111111]">
        Begin Your <br />
        <span className="font-onari font-normal text-[#8A2722] text-6xl lg:text-8xl tracking-wider mt-2 inline-block">
          Journey
        </span>
      </h1>

      {/* Subheading */}
      <p className="text-lg text-[#4A4A4A] max-w-md leading-relaxed font-sans mb-8">
        Join a community of builders, dreamers, and creators turning ideas into impact.
      </p>

      {/* Accent Tagline */}
      <div>
        <div className="font-sans uppercase tracking-[0.1em] text-sm font-semibold text-[#8A2722] flex items-center gap-2">
          <span className="w-8 h-px bg-[#8A2722]" />
          CODE. COLLABORATE. CONTRIBUTE.
        </div>
      </div>
    </div>
  );

  const rightContent = (
    <div className="p-6 sm:p-8">
      {/* Form Header */}
      <div className="pb-6 border-b border-[#D8D0C8]">
        <h2 className="font-onari text-4xl font-normal text-[#8A2722] mb-1">
          Register Now
        </h2>
        <p className="text-[#4A4A4A] text-sm">
          Share your personal details and socials to complete your profile.
        </p>
        {/* Accent Red Bar */}
        <div className="w-full bg-[#D8D0C8] h-1 mt-5 rounded-full overflow-hidden">
          <div className="bg-[#B93A32] h-full w-full rounded-full" />
        </div>
      </div>

      {/* Single Section Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <div className="p-5 sm:p-6 bg-[#FAF8F4]/80 rounded-xl border border-[#D8D0C8]/70 space-y-5">
          <div className="flex items-center gap-2 border-b border-[#D8D0C8]/60 pb-3">
            <span className="w-1.5 h-5 bg-[#B93A32] rounded-full" />
            <h3 className="font-sans text-base font-semibold text-[#111111]">
              1. Personal details &amp; Socials
            </h3>
          </div>

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-medium text-[#4A4A4A] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#B93A32]" />
                Name <span className="text-[#B93A32]">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Your full name"
                {...register('fullName')}
                className="bg-white border-[#D8D0C8] focus-visible:ring-[#B93A32]/30"
              />
              {errors.fullName && (
                <p className="text-xs text-[#B93A32] font-medium">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-[#4A4A4A] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#B93A32]" />
                Email <span className="text-[#B93A32]">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email address"
                {...register('email')}
                className="bg-white border-[#D8D0C8] focus-visible:ring-[#B93A32]/30"
              />
              {errors.email && (
                <p className="text-xs text-[#B93A32] font-medium">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Phone Number & Discord */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-medium text-[#4A4A4A] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#B93A32]" />
                Phone Number <span className="text-[#B93A32]">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Your phone number"
                {...register('phone')}
                className="bg-white border-[#D8D0C8] focus-visible:ring-[#B93A32]/30"
              />
              {errors.phone && (
                <p className="text-xs text-[#B93A32] font-medium">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="discord" className="text-xs font-medium text-[#4A4A4A] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#B93A32]" />
                Discord username <span className="text-[#B93A32]">*</span>
              </Label>
              <Input
                id="discord"
                placeholder="yourusername"
                {...register('discord')}
                className="bg-white border-[#D8D0C8] focus-visible:ring-[#B93A32]/30"
              />
              {errors.discord && (
                <p className="text-xs text-[#B93A32] font-medium">{errors.discord.message}</p>
              )}
            </div>
          </div>

          {/* College Name & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="collegeName" className="text-xs font-medium text-[#4A4A4A] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#B93A32]" />
                College name <span className="text-[#B93A32]">*</span>
              </Label>
              <Input
                id="collegeName"
                placeholder="Your college or institute"
                {...register('collegeName')}
                className="bg-white border-[#D8D0C8] focus-visible:ring-[#B93A32]/30"
              />
              {errors.collegeName && (
                <p className="text-xs text-[#B93A32] font-medium">{errors.collegeName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="branch" className="text-xs font-medium text-[#4A4A4A] flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#B93A32]" />
                Department <span className="text-[#B93A32]">*</span>
              </Label>
              <Input
                id="branch"
                placeholder="Example: CSE"
                {...register('branch')}
                className="bg-white border-[#D8D0C8] focus-visible:ring-[#B93A32]/30"
              />
              {errors.branch && (
                <p className="text-xs text-[#B93A32] font-medium">{errors.branch.message}</p>
              )}
            </div>
          </div>

          {/* Year & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#4A4A4A] flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#B93A32]" />
                Year <span className="text-[#B93A32]">*</span>
              </Label>
              <Select onValueChange={(val) => setValue('year', val)}>
                <SelectTrigger className="bg-white border-[#D8D0C8] focus:ring-[#B93A32]/30">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">1st Year</SelectItem>
                  <SelectItem value="2nd">2nd Year</SelectItem>
                  <SelectItem value="3rd">3rd Year</SelectItem>
                  <SelectItem value="4th">4th Year</SelectItem>
                  <SelectItem value="5th">5th Year</SelectItem>
                  <SelectItem value="Graduate">Graduate</SelectItem>
                </SelectContent>
              </Select>
              {errors.year && (
                <p className="text-xs text-[#B93A32] font-medium">{errors.year.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-xs font-medium text-[#4A4A4A] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#B93A32]" />
                Location <span className="text-[#B93A32]">*</span>
              </Label>
              <Input
                id="location"
                placeholder="City, Country"
                {...register('location')}
                className="bg-white border-[#D8D0C8] focus-visible:ring-[#B93A32]/30"
              />
              {errors.location && (
                <p className="text-xs text-[#B93A32] font-medium">{errors.location.message}</p>
              )}
            </div>
          </div>

          {/* Twitter & Instagram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="twitter" className="text-xs font-medium text-[#4A4A4A]">
                Twitter (X) <span className="text-[#B93A32]">*</span>
              </Label>
              <Input
                id="twitter"
                placeholder="@handle"
                {...register('twitter')}
                className="bg-white border-[#D8D0C8] focus-visible:ring-[#B93A32]/30"
              />
              {errors.twitter && (
                <p className="text-xs text-[#B93A32] font-medium">{errors.twitter.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="instagram" className="text-xs font-medium text-[#4A4A4A]">
                Instagram
              </Label>
              <Input
                id="instagram"
                placeholder="@handle"
                {...register('instagram')}
                className="bg-white border-[#D8D0C8] focus-visible:ring-[#B93A32]/30"
              />
              {errors.instagram && (
                <p className="text-xs text-[#B93A32] font-medium">{errors.instagram.message}</p>
              )}
            </div>
          </div>

          {/* Bio (Required) */}
          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-xs font-medium text-[#4A4A4A] flex items-center justify-between">
              <span>Bio <span className="text-[#B93A32]">*</span></span>
              <span className="text-[10px] text-[#777777]">Required</span>
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself, your tech stack, goals, and experience..."
              className="bg-white border-[#D8D0C8] focus-visible:ring-[#B93A32]/30 min-h-24 resize-none"
              {...register('bio')}
            />
            {errors.bio && (
              <p className="text-xs text-[#B93A32] font-medium">{errors.bio.message}</p>
            )}
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="bg-[#111111] hover:bg-[#8A2722] text-[#F7F3EE] px-8 py-3.5 h-auto rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 shadow-md"
            disabled={completeProfile.isPending}
          >
            {completeProfile.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <span>Complete Profile</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );

  return <SplitLayout left={leftContent} right={rightContent} />;
}
