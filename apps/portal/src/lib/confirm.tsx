import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

interface ConfirmOptions {
  title?: string;
  description: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning';
}

export const confirmAction = ({
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'default'
}: ConfirmOptions) => {
  toast.custom((t) => (
    <div className="bg-[#121214] border border-white/10 p-6 rounded-3xl shadow-2xl w-[350px] animate-in slide-in-from-right-5 duration-300">
      <div className="flex items-start gap-4 mb-5">
        <div className={`p-3 rounded-2xl shrink-0 ${
          variant === 'danger' ? 'bg-red-500/10 text-red-500' :
          variant === 'warning' ? 'bg-amber-500/10 text-amber-500' :
          'bg-brand/10 text-brand'
        }`}>
          <AlertCircle size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-black uppercase tracking-widest text-white">
            {title || "Confirm Action"}
          </h4>
          <p className="text-xs text-white/50 font-medium leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            onConfirm();
            toast.dismiss(t);
          }}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            variant === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white' :
            'bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/20'
          }`}
        >
          {confirmText}
        </button>
        <button
          onClick={() => {
            if (onCancel) onCancel();
            toast.dismiss(t);
          }}
          className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all border border-white/5"
        >
          {cancelText}
        </button>
      </div>

      <button
        onClick={() => toast.dismiss(t)}
        className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  ), {
    duration: Infinity,
    position: 'bottom-right'
  });
};
