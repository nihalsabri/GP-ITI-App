import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function Home() {
  const categoryScrollRef = useRef(null);
  const jobsScrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const categories = [
    {
      name: 'Landscaper',
      icon: require('../assets/landscaper.png'),
      gradientFrom: 'from-green-500',
      gradientTo: 'to-green-600',
    },
    {
      name: 'Garages',
      icon: require('../assets/garage.png'),
      gradientFrom: 'from-gray-500',
      gradientTo: 'to-gray-600',
    },
    {
      name: 'Electrician',
      icon: require('../assets/electrician.png'),
      gradientFrom: 'from-yellow-500',
      gradientTo: 'to-yellow-600',
    },
    {
      name: 'Locksmith',
      icon: require('../assets/lock.png'),
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-blue-600',
    },
    {
      name: 'Plumber',
      icon: require('../assets/plumber.png'),
      gradientFrom: 'from-cyan-500',
      gradientTo: 'to-cyan-600',
    },
    {
      name: 'Joiner',
      icon: require('../assets/joiner.png'),
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-amber-600',
    },
    {
      name: 'Decorator',
      icon: require('../assets/decorator.png'),
      gradientFrom: 'from-pink-500',
      gradientTo: 'to-pink-600',
    },
    {
      name: 'Building',
      icon: require('../assets/building.png'),
      gradientFrom: 'from-orange-500',
      gradientTo: 'to-orange-600',
    },
    {
      name: 'Roofing',
      icon: require('../assets/roofing.png'),
      gradientFrom: 'from-red-500',
      gradientTo: 'to-red-600',
    },
  ];

  const popularJobs = [
    { title: 'Electrician', image: require('../assets/Electrician-img.jpeg') },
    { title: 'Windows, doors, conservatory', image: require('../assets/conservatory-img.jpeg') },
    { title: 'Gas engineer', image: require('../assets/gas-engineer-img.webp') },
    { title: 'Tiling', image: require('../assets/Tiling.webp') },
    { title: 'Building', image: require('../assets/building-img.webp') },
    { title: 'Roofing', image: require('../assets/roofing-img.webp') },
  ];

  const partners = [
    "Sky's The Limit Scaffolding",
    'Purple Digital',
    'Hampshire Roofing',
    'Dreams & Monuments',
    'Conservatory',
  ];

  const stats = [
    { value: '4000+', label: 'tradespeople' },
    { value: '56', label: 'trades covered' },
    { value: '200+', label: 'websites built' },
    { value: '124', label: 'products covered' },
  ];

  const tradespeople = [
    'Aerial Installations',
    'Air Conditioning Specialist',
    'Architect/Designer',
    'Asbestos Removal',
    'Asbestos Surveyors',
    'Bathroom Fitter',
    'Driveways',
    'Drylinings',
    'EICR (Electrical)',
    'Electric Gates',
    'Paving',
    'Pest Control',
    'Plumber',
    'Plasterers',
  ];

  const scrollCategory = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300;
      categoryScrollRef.current.scrollTo({
        x: direction === 'left' ? -scrollAmount : scrollAmount,
        animated: true,
      });
    }
  };

  const getBgColorFromGradient = (gradientFrom) => {
    const colorMap = {
      'from-green-500': 'bg-green-500',
      'from-gray-500': 'bg-gray-500',
      'from-yellow-500': 'bg-yellow-500',
      'from-blue-500': 'bg-blue-500',
      'from-cyan-500': 'bg-cyan-500',
      'from-amber-500': 'bg-amber-500',
      'from-pink-500': 'bg-pink-500',
      'from-orange-500': 'bg-orange-500',
      'from-red-500': 'bg-red-500',
    };
    return colorMap[gradientFrom] || 'bg-blue-500';
  };

  const renderCategoryCard = (cat, idx) => (
    <TouchableOpacity
      key={idx}
      className="flex min-w-[120px] flex-shrink-0 flex-col items-center rounded-xl border border-gray-100 bg-white p-6 shadow-md"
      activeOpacity={0.7}>
      <View
        className={`h-16 w-16 rounded-full ${getBgColorFromGradient(cat.gradientFrom)} mb-3 flex items-center justify-center shadow-lg`}>
        <Image source={cat.icon} className="h-10 w-10" resizeMode="contain" />
      </View>
      <Text className="text-center text-sm font-semibold text-gray-800">{cat.name}</Text>
    </TouchableOpacity>
  );

  const renderJobCard = (job, heightClass, idx) => (
    <View
      key={idx}
      className={`w-[280px] ${heightClass} relative mb-4 overflow-hidden rounded-2xl shadow-md`}>
      <Image source={job.image} className="h-full w-full" resizeMode="cover" />
      <View className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <View className="absolute bottom-0 left-0 right-0 p-5">
        <Text className="text-xl font-bold text-white">{job.title}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View className="px-4 py-12 md:py-16">
        <View className="flex flex-col gap-8 lg:flex-row">
          <View className="order-1 h-64 overflow-hidden rounded-2xl shadow-2xl sm:h-80 md:h-full lg:order-2">
            <Image source={require('../assets/main.jpeg')} />
          </View>

          <View className="order-2 flex flex-col justify-center rounded-2xl bg-[#372B70] px-6 py-12 text-white shadow-2xl md:px-10 md:py-24 lg:order-1 lg:flex-[2] lg:px-12 lg:py-32">
            <Text className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Find a trusted tradesperson online
            </Text>
            <Text className="mb-6 text-base text-purple-100 sm:mb-8 sm:text-lg">
              Thousands of tradespeople are waiting to help you.
            </Text>

            <View className="flex flex-col gap-4 sm:flex-row">
              <TextInput
                placeholder="Trade e.g. Plumber, Electrician"
                placeholderTextColor="#6b7280"
                className="flex-1 rounded-3xl border border-blue-200 bg-blue-50 px-4 py-3 text-gray-900"
              />
              <TouchableOpacity className="flex w-full items-center justify-center rounded-full bg-purple-50 p-3 sm:w-12">
                <Search className="h-6 w-6" color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Search by Category */}
      <View className="bg-white px-4 py-16">
        <Text className="mb-12 text-center text-3xl font-bold">Search by Category</Text>
        <View className="relative">
          <TouchableOpacity
            onPress={() => scrollCategory('left')}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg">
            <ChevronLeft className="h-6 w-6" color="#374151" />
          </TouchableOpacity>

          <ScrollView
            ref={categoryScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pb-4"
            contentContainerClassName="gap-4">
            {categories.map(renderCategoryCard)}
          </ScrollView>

          <TouchableOpacity
            onPress={() => scrollCategory('right')}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg">
            <ChevronRight className="h-6 w-6" color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Popular Jobs */}
      <View className="bg-gray-50 px-4 py-16">
        <Text className="mb-12 text-center text-4xl font-bold text-gray-900">Popular Jobs</Text>
        <View className="relative">
          <ScrollView
            ref={jobsScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="pb-4">
            <View className="flex flex-row gap-4">
              {/* First Set */}
              {renderJobCard(popularJobs[0], 'h-[384px]', 0)}
              <View className="flex flex-col gap-4">
                {renderJobCard(popularJobs[3], 'h-[184px]', 3)}
                {renderJobCard(popularJobs[1], 'h-[184px]', 1)}
              </View>
              {renderJobCard(popularJobs[5], 'h-[384px]', 5)}
              <View className="flex flex-col gap-4">
                {renderJobCard(popularJobs[4], 'h-[184px]', 4)}
                {renderJobCard(popularJobs[2], 'h-[184px]', 2)}
              </View>

              {/* Duplicate Set for infinite scroll */}
              {renderJobCard(popularJobs[0], 'h-[384px]', '0-dup')}
              <View className="flex flex-col gap-4">
                {renderJobCard(popularJobs[3], 'h-[184px]', '3-dup')}
                {renderJobCard(popularJobs[1], 'h-[184px]', '1-dup')}
              </View>
              {renderJobCard(popularJobs[5], 'h-[384px]', '5-dup')}
              <View className="flex flex-col gap-4">
                {renderJobCard(popularJobs[4], 'h-[184px]', '4-dup')}
                {renderJobCard(popularJobs[2], 'h-[184px]', '2-dup')}
              </View>
            </View>
          </ScrollView>
        </View>

        <View className="mt-6 flex flex-row justify-center gap-2">
          <View className="h-2 w-2 rounded-full bg-gray-300" />
          <View className="h-2 w-2 rounded-full bg-gray-300" />
          <View className="h-2 w-2 rounded-full bg-gray-900" />
        </View>
      </View>

      {/* Where Peace of Mind Matters */}
      <View className="bg-white px-4 py-16">
        <View className="flex flex-col items-center gap-12 lg:flex-row">
          <View className="relative aspect-video flex-1 overflow-hidden rounded-lg shadow-2xl">
            <Image
              source={require('../assets/main.jpeg')}
              className="h-full w-full rounded-xl"
              resizeMode="cover"
            />
          </View>

          <View className="flex-1 space-y-6">
            <Text className="mb-6 text-3xl font-bold text-[#372b70]">
              Where Peace of Mind Matters
            </Text>
            <Text className="text-base leading-6 text-black">
              Tradesmen Online is the easiest & safest way to find a reliable tradesperson. Giving
              you peace of mind knowing that you will get exactly what you expected with a great
              customer experience.
            </Text>
            <Text className="text-base leading-6 text-black">
              We have over four thousand tradespeople across the UK who advertise on our platform.
            </Text>

            <Text className="mb-6 mt-8 text-xl font-bold text-gray-900">Why choose us?</Text>
            <View className="flex flex-row flex-wrap justify-around gap-6">
              {stats.map((stat, idx) => (
                <View key={idx} className="items-center text-center">
                  <Text className="text-3xl font-bold text-[#372b70]">{stat.value}</Text>
                  <Text className="text-sm text-gray-600">{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Action Cards */}
      <View className="bg-gray-50 px-4 py-16">
        <View className="flex flex-col gap-8 md:flex-row">
          {[
            {
              img: require('../assets/roofing-img.webp'),
              title: 'Submit a Job Enquiry',
              desc: "Tell us what you need doing and we'll put you in touch with our qualified tradespeople",
              btn: 'Post an Enquiry',
            },
            {
              img: require('../assets/card2.webp'),
              title: 'Sign up to become a tradesperson',
              desc: 'If you are looking to expand your customer base, there is no better platform than Tradesmen Online.',
              btn: 'Join our Tradesperson Directory',
            },
            {
              img: require('../assets/card3.webp'),
              title: 'Tell us what you think',
              desc: 'Happy with the work your tradesperson just completed? Let them know what you think.',
              btn: 'Leave a review',
            },
          ].map((card, idx) => (
            <View key={idx} className="flex-1 overflow-hidden rounded-lg bg-white shadow-lg">
              <View className="overflow-hidden">
                <Image source={card.img} className="h-48 w-full" resizeMode="cover" />
              </View>
              <View className="p-6">
                <Text className="mb-3 text-lg font-bold">{card.title}</Text>
                <Text className="mb-4 text-sm text-gray-600">{card.desc}</Text>
                <TouchableOpacity className="w-full rounded-xl border border-[#372b70] bg-[#372b70] py-3">
                  <Text className="text-center font-semibold text-white">{card.btn}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Trusted Partners */}
      <View className="bg-white px-4 py-16">
        <Text className="mb-12 text-center text-3xl font-bold">Our Trusted Partners</Text>
        <View className="flex flex-row flex-wrap items-center justify-center gap-16">
          {partners.map((partner, idx) => (
            <TouchableOpacity key={idx} className="relative">
              <Text className="text-lg font-semibold text-gray-400">{partner}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Active Roofing Banner */}
      <View className="bg-gray-50 px-4 py-16">
        <View className="flex flex-col items-center gap-12 lg:flex-row">
          <View className="order-2 flex-1 lg:order-1">
            <Text className="mb-6 text-3xl font-bold leading-tight text-gray-900">
              Bringing you the best in the trade
            </Text>
            <Text className="mb-4 text-base leading-relaxed text-gray-700">
              Our tradespeople represent the highest standard of quality and professionalism. With
              exceptional workmanship, outstanding customer service, and consistently top-rated
              reviews, these experts have earned their place on our website.
            </Text>
            <Text className="mb-6 text-base leading-relaxed text-gray-700">
              When you choose a tradesperson through Tradesmen Online, you are choosing peace of
              mind, knowing your project is in the hands of someone who delivers excellence every
              time.
            </Text>
            <TouchableOpacity className="mt-6 rounded-lg bg-[#372b70] px-8 py-4">
              <Text className="text-center text-lg font-semibold text-white">
                Find a Local Tradesperson
              </Text>
            </TouchableOpacity>
          </View>

          <View className="order-1 flex-1 overflow-hidden rounded-2xl shadow-2xl lg:order-2">
            <Image
              source={require('../assets/active-roofing-banner.webp')}
              className="h-[400px] w-full"
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      {/* Find Tradespeople */}
      <View className="bg-white px-4 py-16">
        <Text className="mb-12 text-center text-3xl font-bold">Find Tradespeople</Text>
        <View className="flex flex-col gap-8 md:flex-row">
          {[0, 1, 2].map((col) => (
            <View key={col} className="flex-1 space-y-3">
              {tradespeople.slice(col * 5, (col + 1) * 5).map((trade, idx) => (
                <TouchableOpacity key={idx}>
                  <Text className="text-[#372b70]">{trade} near me</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
