"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";



import {
    Brain,
    Calendar,
    Activity,
    Sun,
    Moon,
    Heart,
    Trophy,
    Bell,
    AlertCircle,
    PhoneCall,
    Sparkles,
    MessageSquare,
    BrainCircuit,
    ArrowRight,
    X,
    Loader2
  } from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ActivityLogger } from "@/components/activities/activity-logger";   

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MoodForm } from "@/components/mood/mood-form";
import { useRouter } from "next/navigation";
import { AnxietyGames } from "@/components/games/anxiety-games";
import {
    addDays,
    format,
    subDays,
    startOfDay,
    isWithinInterval,
  } from "date-fns";

export default function DashboardPage() {

    const [currentTime, setCurrentTime] = useState(new Date());

    const [showMoodModal, setShowMoodModal] = useState(false);
    const [isSavingMood, setIsSavingMood] = useState(false);
    const [showActivityLogger, setShowActivityLogger] = useState(false);
    const router = useRouter();

    // Update wellness stats to reflect the changes
    const wellnessStats = [
        {
            title: "Mood Score",
            value: "No data",
            icon: Brain,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
            description: "Today's average mood",
        },
        {
            title: "Completion Rate",
            value: "100%",
            icon: Trophy,
            color: "text-yellow-500",
            bgColor: "bg-yellow-500/10",
            description: "Perfect Completion Rate",
        },
        {
            title: "Therapy Sessions",
            value: "0 sessions",
            icon: Heart,
            color: "text-rose-500",
            bgColor: "bg-rose-500/10",
            description: "Total sessions completed",
        },
        {
            title: "Total Activities",
            value: "80",
            icon: Activity,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            description: "Planned for today",
        },
    ];

    const handleMoodSubmit = async (data: { moodScore: number }) => {
    setIsSavingMood(true);
    try {
      setShowMoodModal(false);
    } catch (error) {
      console.error("Error saving mood:", error);
    } finally {
      setIsSavingMood(false);
    }
  };

  const handleAICheckIn = () => {
    setShowActivityLogger(true);
  };

  const handleStartTherapy = () => {
        // Navigate to a new therapy session. The therapy route is dynamic ([sessionId]),
        // so we can use a literal 'new' id or generate one server-side later.
        router.push("/therapy/new");
  };


    
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-background p-8">
            <Container className="pt-20 pb-8 space-y-6">
                <div className="flex flex-col gap-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col gap-2"
                    >
                        <h1 className="text-3xl font-bold">Welcome Back</h1>
                        <p className="text-muted-foreground text-sm">
                            {currentTime.toLocaleString("en-IN", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true // Use true for 12-hour (AM/PM) format, false for 24-hour
                            })}
                        </p>
                    </motion.div>
                </div>
                {/* main grid layout */}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className="border-primary/10 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-primary/10 to-transparent" />
                            <CardContent className="p-6 relative">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Quick Actions</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Start your wellness journey
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-3 mt-4">
                                    <Button
                                        variant="default"
                                        className={cn("w-full justify-between items-center p-6 h-auto group/button", "bg-linear-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90", "transition-all duration-200 group-hover:-translate-y-0.5")}
                                        onClick={handleStartTherapy}
                                        >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                <MessageSquare className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-semibold text-white">
                                                    Start Therapy
                                                </div>
                                                <div className="text-xs text-white/80">
                                                    Begin a new session
                                                </div>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover/button:opacity-100 transition-opacity">
                                            <ArrowRight className="w-5 h-5 text-white" />
                                        </div>
                                    </Button>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" className={cn("flex flex-col h-[120px] px-4 py-3 group/mood hover:border-primary/50 hover:scale-105 hover:shadow-lg", "justify-center items-center text-center", "transition-all duration-200")}
                                            onClick={() => setShowMoodModal(true)}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-2">
                                                <Heart className="w-5 h-5 text-rose-500" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">Track Mood</div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    How are you feeling?
                                                </div>
                                            </div>
                                        </Button>
                                        <Button variant="outline" className={cn("flex flex-col h-[120px] px-4 py-3 group/ai hover:border-primary/50 hover:scale-105 hover:shadow-lg", "justify-center items-center text-center", "transition-all duration-200 group-hover:-translate-y-0.5")}
                                        onClick={handleAICheckIn}>
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                                                <BrainCircuit className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">
                                                    Check-in
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    Quick wellness check
                                                </div>
                                            </div>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* today's overview card */}
                        <Card className="border-primary/10">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>
                                            Today's Overview
                                        </CardTitle>
                                        <CardDescription>
                                            Your wellness metrics for{" "}
                                            {format(new Date(), "MMMM d, yyyy")}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3">
                                    {wellnessStats.map((stat) => {
                                        const IconComponent = stat.icon;
                                        return (
                                            <div
                                                key={stat.title}
                                                className={cn(
                                                    "p-4 rounded-lg transition-all duration-200 hover:scale-[1.02]",
                                                    stat.bgColor
                                                )}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <IconComponent className={cn("w-5 h-5", stat.color)} />
                                                    <p className="text-sm font-medium">{stat.title}</p>
                                                </div>
                                                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {stat.description}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* content grid for games */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-3 space-y-6">
                            {/* anxiety games*/}

                            <AnxietyGames  />
                        </div>
                    </div>
                </div>
            </Container>

            {/* Mood tracking modal */}
            <Dialog open={showMoodModal} onOpenChange={setShowMoodModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>How are you feeling?</DialogTitle>
                        <DialogDescription>
                            Move the slider to track your current mood
                        </DialogDescription>
                    </DialogHeader>
                    {/*moodform*/}
                    <MoodForm onSuccess={() => setShowMoodModal(false)} />
                </DialogContent>
            </Dialog>
            {/* Activity logger dialog (opened by Check-in) */}
                  <ActivityLogger
        open={showActivityLogger}
        onOpenChange={setShowActivityLogger}
        onActivityLogged={() => {
          // close the activity logger after an activity is logged
          setShowActivityLogger(false);
        }}
      />
        </div>
    );
}