import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';
import { Button } from '@/components/ui/button';
import { teamMembers } from '@/data/team';
import {
  AlertTriangle,
  BarChart3,
  Linkedin,
  MessageSquare,
  Shield,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col items-center justify-start bg-gradient-to-b from-background via-background/90 to-muted text-center overflow-y-auto">
      <BackgroundBeamsWithCollision className="min-h-[calc(100vh-4rem)] py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="pointer-events-none absolute inset-0 backdrop-blur-[1px]" />

        <div className="flex flex-col items-center gap-8 max-w-7xl mx-auto px-4">
          <header className="relative">
            <h1 className="animate-gradient bg-gradient-to-r from-primary via-primary/80 to-primary bg-[length:200%_auto] bg-clip-text text-6xl font-bold tracking-wider text-transparent transition-all duration-300 hover:scale-105">
              Misfits AI
            </h1>
          </header>

          <section className="w-full grid gap-8 md:grid-cols-4 md:gap-6">
            {/* Risk Card - Enhanced Red theme */}
            <div className="group relative flex flex-col items-center gap-4 rounded-lg bg-gradient-to-br from-red-500/10 via-card to-card p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/20">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-red-500/20 via-red-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-tl from-rose-500/10 via-red-500/5 to-transparent opacity-50 animate-pulse" />
              <AlertTriangle className="relative h-12 w-12 text-red-500 transition-all duration-300 group-hover:scale-110 group-hover:text-rose-400" />
              <h3 className="relative text-xl font-semibold transition-colors group-hover:text-red-400">
                Risk Detection
              </h3>
              <p className="relative text-sm text-muted-foreground group-hover:text-red-200/90">
                AI analyzes Certificate of Occupancy (CO) data to identify
                potential building health risks and structural concerns.
              </p>
            </div>

            {/* Investment Card - Enhanced Blue theme */}
            <div className="group relative flex flex-col items-center gap-4 rounded-lg bg-gradient-to-br from-blue-500/10 via-card to-card p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/20">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-tl from-cyan-500/10 via-blue-500/5 to-transparent opacity-50 animate-pulse" />
              <BarChart3 className="relative h-12 w-12 text-blue-500 transition-all duration-300 group-hover:scale-110 group-hover:text-cyan-400" />
              <h3 className="relative text-xl font-semibold transition-colors group-hover:text-blue-400">
                Predictive Analysis
              </h3>
              <p className="relative text-sm text-muted-foreground group-hover:text-blue-200/90">
                Extract patterns from historical CO documents to predict
                building maintenance needs and potential structural issues.
              </p>
            </div>

            {/* Safety Card - Enhanced Green theme */}
            <div className="group relative flex flex-col items-center gap-4 rounded-lg bg-gradient-to-br from-green-500/10 via-card to-card p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/20">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-tl from-emerald-500/10 via-green-500/5 to-transparent opacity-50 animate-pulse" />
              <Shield className="relative h-12 w-12 text-green-500 transition-all duration-300 group-hover:scale-110 group-hover:text-emerald-400" />
              <h3 className="relative text-xl font-semibold transition-colors group-hover:text-green-400">
                Building Health Insights
              </h3>
              <p className="relative text-sm text-muted-foreground group-hover:text-green-200/90">
                Transform unstructured CO data into actionable insights about
                building health and safety compliance.
              </p>
            </div>

            {/* Chat Card - Purple theme */}
            <div className="group relative flex flex-col items-center gap-4 rounded-lg bg-gradient-to-br from-purple-500/10 via-card to-card p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/20">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-tl from-violet-500/10 via-purple-500/5 to-transparent opacity-50 animate-pulse" />
              <MessageSquare className="relative h-12 w-12 text-purple-500 transition-all duration-300 group-hover:scale-110 group-hover:text-violet-400" />
              <h3 className="relative text-xl font-semibold transition-colors group-hover:text-purple-400">
                AI Chat Assistant
              </h3>
              <p className="relative text-sm text-muted-foreground group-hover:text-purple-200/90">
                Chat with our AI to explore and understand building data,
                getting instant insights from CO documents.
              </p>
            </div>
          </section>

          <section className="w-full max-w-5xl relative z-10">
            <h2 className="mb-12 text-2xl font-bold">Meet Our Team</h2>
            <div className="grid grid-cols-2 gap-x-16 gap-y-12 md:grid-cols-4">
              {teamMembers.map((member) => (
                <a
                  key={member.name}
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center"
                >
                  <div className="relative h-28 w-28 overflow-hidden rounded-full transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/25">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/50 to-primary opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="relative object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                      <Linkedin className="h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="font-semibold text-foreground/90">
                      {member.name}
                    </p>
                    <p className="text-sm text-muted-foreground/90">
                      {member.role}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section className="pb-8">
            <Button
              asChild
              size="lg"
              className="relative overflow-hidden bg-primary text-lg font-semibold transition-all duration-300 hover:bg-primary/90 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
            >
              <Link href="/projects" className="relative z-10">
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 transition-opacity duration-300 hover:opacity-100" />
              </Link>
            </Button>
          </section>
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  );
}
