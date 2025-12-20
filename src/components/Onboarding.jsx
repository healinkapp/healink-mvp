import { useState } from 'react';
import { 
  X, 
  Users, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Lightbulb 
} from 'lucide-react';

/**
 * ONBOARDING COMPONENT
 * 
 * Features:
 * - Multi-step tutorial for new users
 * - Explains key features of the platform
 * - Can be dismissed or skipped
 * - Shows once per user (controlled by parent)
 * 
 * Icons: X (close), Users, Mail, Calendar, CheckCircle2, ArrowRight, Sparkles
 */

const ONBOARDING_STEPS = [
  {
    id: 1,
    icon: Users,
    title: 'Welcome to Healink!',
    description: 'Track and manage your clients\' tattoo healing journeys with ease.',
    tip: 'Add your first client to get started',
    color: 'bg-purple-500'
  },
  {
    id: 2,
    icon: Mail,
    title: 'Automated Follow-ups',
    description: 'Clients receive personalized aftercare emails throughout their healing journey.',
    tip: 'Emails are sent automatically on Day 0, 3, 7, and 14',
    color: 'bg-blue-500'
  },
  {
    id: 3,
    icon: Calendar,
    title: 'Track Progress',
    description: 'Monitor each client\'s healing progress with visual indicators and timelines.',
    tip: 'See days elapsed and completion status at a glance',
    color: 'bg-green-500'
  },
  {
    id: 4,
    icon: CheckCircle2,
    title: 'You\'re All Set!',
    description: 'Start adding clients and let Healink handle the rest.',
    tip: 'Click the + button to add your first client',
    color: 'bg-orange-500'
  }
];

function Onboarding({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const Icon = step.icon;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slideIn">
        {/* Header */}
        <div className="relative">
          {/* Decorative Background */}
          <div className={`${step.color} h-32 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <Sparkles className="absolute top-4 right-4 w-6 h-6 text-white/40" />
            <Sparkles className="absolute bottom-8 left-8 w-4 h-4 text-white/30" />
          </div>

          {/* Close Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
            aria-label="Close onboarding"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Icon */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <div className={`${step.color} w-20 h-20 rounded-full flex items-center justify-center shadow-lg`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 px-8 pb-8 text-center">
          <h2 className="text-2xl font-bold text-black mb-3">
            {step.title}
          </h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            {step.description}
          </p>
          
          {/* Tip Box */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-700 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span><span className="font-semibold">Tip:</span> {step.tip}</span>
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {ONBOARDING_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'w-8 bg-black' 
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Previous
              </button>
            )}
            
            <button
              onClick={handleNext}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all ${
                currentStep === 0 ? 'w-full' : ''
              }`}
            >
              <span>{isLastStep ? 'Get Started' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Skip Button */}
          {!isLastStep && (
            <button
              onClick={handleSkip}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
