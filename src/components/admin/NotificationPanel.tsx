import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { 
  Bell, 
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-foreground" />
                <h3 className="font-semibold text-foreground">Notifications</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Coming Soon Content */}
            <div className="flex-1 flex items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-sm"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
                  <div className="relative p-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl border border-primary/20">
                    <Bell className="h-12 w-12 text-primary mx-auto opacity-80" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Coming Soon
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The notification system is currently under development. You'll be able to receive and manage notifications here soon.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;