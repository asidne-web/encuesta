import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import './RestoreDialog.css';

interface RestoreDialogProps {
  visible: boolean;
  clientName: string;
  onRestore: () => void;
  onDiscard: () => void;
}

export const RestoreDialog: React.FC<RestoreDialogProps> = ({
  visible,
  clientName,
  onRestore,
  onDiscard,
}) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        className="restore-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <motion.div
          className="restore-dialog"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="restore-dialog__icon">💾</div>
          <h2 className="restore-dialog__title">Sesión guardada encontrada</h2>
          <p className="restore-dialog__text">
            Se ha detectado un cuestionario en progreso para <strong>{clientName}</strong>.
            ¿Desea continuar donde lo dejó o empezar de nuevo?
          </p>
          <div className="restore-dialog__actions">
            <Button variant="secondary" fullWidth onClick={onDiscard} icon="🗑️">
              Empezar de nuevo
            </Button>
            <Button variant="primary" fullWidth onClick={onRestore} icon="▶️">
              Continuar
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
