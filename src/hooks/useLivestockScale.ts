import { useState, useEffect, useRef, useCallback } from 'react';
import { ScaleDevice, ScaleReading, ScaleConnectionType, ScaleBrand } from '../types';
import { INITIAL_AVAILABLE_SCALES, SIMULATED_ANIMAL_WEIGHTS } from '../services/scaleManager';
import { scaleSound } from '../services/scaleSound';

export interface LivestockScaleHook {
  scales: ScaleDevice[];
  activeScale: ScaleDevice | null;
  reading: ScaleReading;
  isScanning: boolean;
  filterSensitivity: 'alta' | 'media' | 'baja';
  currentAnimalIndex: number;
  // Actions
  connectScale: (scaleId: string) => Promise<void>;
  disconnectScale: (scaleId: string) => void;
  scanForBluetoothDevices: () => Promise<void>;
  connectWifiScale: (ip: string, port: number) => Promise<void>;
  connectSerialScale: (baud: number) => Promise<void>;
  tareScale: () => void;
  lockCurrentWeight: () => number;
  unlockWeight: () => void;
  simulateNextAnimal: (targetWeight?: number, tag?: string, eid?: string) => void;
  setPlatformEmpty: () => void;
  toggleSound: () => void;
  toggleRFID: () => void;
  setUnit: (unit: 'kg' | 'lb') => void;
  setFilterSensitivity: (s: 'alta' | 'media' | 'baja') => void;
  readRFIDTag: () => string;
}

export const useLivestockScale = (): LivestockScaleHook => {
  const [scales, setScales] = useState<ScaleDevice[]>(INITIAL_AVAILABLE_SCALES);
  const [activeScaleId, setActiveScaleId] = useState<string>('scale-trutest-xr5000');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [filterSensitivity, setFilterSensitivity] = useState<'alta' | 'media' | 'baja'>('alta');
  const [currentAnimalIndex, setCurrentAnimalIndex] = useState<number>(0);

  // Live scale reading state
  const [reading, setReading] = useState<ScaleReading>({
    weight: 442.5,
    isStable: true,
    isLocked: false,
    unit: 'kg',
    timestamp: new Date().toISOString(),
    rawFluctuation: 0,
  });

  const activeScale = scales.find((s) => s.id === activeScaleId && s.status === 'connected') || null;

  // Target weight being simulated
  const targetWeightRef = useRef<number>(442.5);
  const currentLiveWeightRef = useRef<number>(442.5);
  const isStabilizingRef = useRef<boolean>(false);
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const soundEnabledRef = useRef<boolean>(true);

  // Keep sound ref synced
  useEffect(() => {
    soundEnabledRef.current = activeScale ? activeScale.soundFeedback : true;
  }, [activeScale]);

  // Live Weight Fluttering/Fluctuation Engine (Simulating live load cells / cattle movement on crate)
  useEffect(() => {
    if (!activeScale) {
      return;
    }

    const interval = setInterval(() => {
      if (reading.isLocked) return;

      const target = targetWeightRef.current;
      if (target <= 0.5) {
        // Platform is at zero / tared
        setReading((prev) => ({
          ...prev,
          weight: 0.0,
          isStable: true,
          rawFluctuation: 0,
          timestamp: new Date().toISOString(),
        }));
        return;
      }

      if (isStabilizingRef.current) {
        // Cattle is moving around on the platform, live flutter
        const damp = filterSensitivity === 'alta' ? 0.35 : filterSensitivity === 'media' ? 0.2 : 0.1;
        const noise = (Math.random() - 0.5) * (filterSensitivity === 'alta' ? 4.5 : 8.0);
        const nextVal = currentLiveWeightRef.current + (target - currentLiveWeightRef.current) * damp + noise;
        currentLiveWeightRef.current = Math.round(nextVal * 10) / 10;

        setReading((prev) => ({
          ...prev,
          weight: Math.max(0, currentLiveWeightRef.current),
          isStable: false,
          rawFluctuation: noise,
          timestamp: new Date().toISOString(),
        }));
      } else {
        // Settled / stable with tiny natural load cell micro-drift (+-0.1 kg)
        const microDrift = (Math.random() - 0.5) * 0.2;
        const stableWeight = Math.round((target + microDrift) * 10) / 10;

        setReading((prev) => ({
          ...prev,
          weight: stableWeight,
          isStable: true,
          rawFluctuation: 0,
          timestamp: new Date().toISOString(),
        }));
      }
    }, 120);

    return () => clearInterval(interval);
  }, [activeScale, reading.isLocked, filterSensitivity]);

  // Simulate animal entering the chute/scale
  const simulateNextAnimal = useCallback(
    (targetWeight?: number, tag?: string, eid?: string) => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);

      const nextSample = SIMULATED_ANIMAL_WEIGHTS[currentAnimalIndex % SIMULATED_ANIMAL_WEIGHTS.length];
      const assignedWeight = targetWeight ?? nextSample.targetWeight;
      const assignedEid = eid ?? nextSample.eid;

      setCurrentAnimalIndex((prev) => prev + 1);
      targetWeightRef.current = assignedWeight;
      currentLiveWeightRef.current = Math.max(0, assignedWeight - 25 + Math.random() * 15);
      isStabilizingRef.current = true;

      setReading((prev) => ({
        ...prev,
        isLocked: false,
        isStable: false,
        weight: currentLiveWeightRef.current,
      }));

      // Update active scale's last EID tag if RFID is connected
      if (activeScale && activeScale.rfidConnected) {
        setScales((prevScales) =>
          prevScales.map((s) =>
            s.id === activeScale.id ? { ...s, lastEIDTag: assignedEid } : s,
          ),
        );
        if (soundEnabledRef.current) {
          scaleSound.playRFIDChime();
        }
      }

      // Animal settles down and scale locks after stabilization time (1.4s)
      lockTimerRef.current = setTimeout(() => {
        isStabilizingRef.current = false;
        currentLiveWeightRef.current = assignedWeight;

        setReading((prev) => ({
          ...prev,
          weight: assignedWeight,
          isStable: true,
        }));

        if (soundEnabledRef.current) {
          scaleSound.playWeightLockedBeep();
        }
      }, 1400);
    },
    [currentAnimalIndex, activeScale],
  );

  // Set platform empty (0 kg)
  const setPlatformEmpty = useCallback(() => {
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    isStabilizingRef.current = false;
    targetWeightRef.current = 0.0;
    currentLiveWeightRef.current = 0.0;

    setReading((prev) => ({
      ...prev,
      weight: 0.0,
      isStable: true,
      isLocked: false,
      rawFluctuation: 0,
    }));
  }, []);

  // Tare / Zero the scale
  const tareScale = useCallback(() => {
    if (soundEnabledRef.current) {
      scaleSound.playTareBeep();
    }
    setPlatformEmpty();
    setScales((prev) =>
      prev.map((s) => (s.id === activeScaleId ? { ...s, isZeroTare: true } : s)),
    );
  }, [activeScaleId, setPlatformEmpty]);

  // Lock current weight manually
  const lockCurrentWeight = useCallback(() => {
    if (soundEnabledRef.current) {
      scaleSound.playWeightLockedBeep();
    }
    setReading((prev) => ({
      ...prev,
      isLocked: true,
      isStable: true,
    }));
    return reading.weight;
  }, [reading.weight]);

  const unlockWeight = useCallback(() => {
    setReading((prev) => ({
      ...prev,
      isLocked: false,
    }));
  }, []);

  // Read RFID electronic tag
  const readRFIDTag = useCallback((): string => {
    const sample = SIMULATED_ANIMAL_WEIGHTS[currentAnimalIndex % SIMULATED_ANIMAL_WEIGHTS.length];
    const eid = sample.eid;
    if (soundEnabledRef.current) {
      scaleSound.playRFIDChime();
    }
    if (activeScale) {
      setScales((prev) =>
        prev.map((s) => (s.id === activeScale.id ? { ...s, lastEIDTag: eid } : s)),
      );
    }
    return eid;
  }, [currentAnimalIndex, activeScale]);

  // Connect to a specific scale
  const connectScale = useCallback(
    async (scaleId: string) => {
      // Set to connecting
      setScales((prev) =>
        prev.map((s) =>
          s.id === scaleId ? { ...s, status: 'connecting' } : s,
        ),
      );

      // Simulate connection handshake (0.8s)
      await new Promise((res) => setTimeout(res, 800));

      setScales((prev) =>
        prev.map((s) => {
          if (s.id === scaleId) {
            return { ...s, status: 'connected', battery: Math.floor(85 + Math.random() * 14) };
          }
          // Disconnect other scales if single active
          return s.status === 'connected' ? { ...s, status: 'disconnected' } : s;
        }),
      );
      setActiveScaleId(scaleId);

      // Trigger initial animal reading
      simulateNextAnimal();
    },
    [simulateNextAnimal],
  );

  // Disconnect scale
  const disconnectScale = useCallback((scaleId: string) => {
    setScales((prev) =>
      prev.map((s) => (s.id === scaleId ? { ...s, status: 'disconnected' } : s)),
    );
    if (activeScaleId === scaleId) {
      setActiveScaleId('');
    }
  }, [activeScaleId]);

  // Bluetooth scanning (supports Web Bluetooth API when available with fallback)
  const scanForBluetoothDevices = useCallback(async () => {
    setIsScanning(true);

    try {
      if (typeof navigator !== 'undefined' && 'bluetooth' in navigator && (navigator as { bluetooth?: { requestDevice?: () => Promise<unknown> } }).bluetooth?.requestDevice) {
        // Try Web Bluetooth if permitted
        try {
          await (navigator as { bluetooth: { requestDevice: (opt: unknown) => Promise<{ id: string; name: string }> } }).bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['0000180d-0000-1000-8000-00805f9b34fb', '0000ffe0-0000-1000-8000-00805f9b34fb'],
          });
        } catch {
          // Fallback gracefully to simulated discovery
        }
      }
    } catch {
      // Ignore
    }

    // Simulate finding Bluetooth BLE livestock indicators
    await new Promise((res) => setTimeout(res, 1200));

    // Add discovered device if not present
    setScales((prev) => {
      const exists = prev.some((s) => s.id === 'scale-ble-discovered');
      if (exists) return prev;
      return [
        ...prev,
        {
          id: 'scale-ble-discovered',
          name: 'Tru-Test S3 Bluetooth BLE (Detectado)',
          model: 'S3 Mobile Chute Bar',
          brand: 'Tru-Test',
          connectionType: 'bluetooth',
          status: 'disconnected',
          battery: 92,
          signal: 95,
          autoLockSeconds: 1.5,
          isZeroTare: false,
          soundFeedback: true,
          rfidConnected: true,
        },
      ];
    });

    setIsScanning(false);
  }, []);

  // Connect via Wi-Fi IP
  const connectWifiScale = useCallback(async (ip: string, port: number) => {
    const wifiScaleId = 'scale-wifi-ip';
    setScales((prev) =>
      prev.map((s) =>
        s.id === wifiScaleId ? { ...s, status: 'connecting', ipAddress: ip, port } : s,
      ),
    );

    await new Promise((res) => setTimeout(res, 900));

    setScales((prev) =>
      prev.map((s) =>
        s.id === wifiScaleId
          ? { ...s, status: 'connected', ipAddress: ip, port }
          : s.status === 'connected'
          ? { ...s, status: 'disconnected' }
          : s,
      ),
    );
    setActiveScaleId(wifiScaleId);
    simulateNextAnimal();
  }, [simulateNextAnimal]);

  // Connect via Serial RS-232
  const connectSerialScale = useCallback(async (baud: number) => {
    const serialId = 'scale-iconix-fx15';
    setScales((prev) =>
      prev.map((s) =>
        s.id === serialId ? { ...s, status: 'connecting', baudRate: baud } : s,
      ),
    );

    await new Promise((res) => setTimeout(res, 900));

    setScales((prev) =>
      prev.map((s) =>
        s.id === serialId
          ? { ...s, status: 'connected', baudRate: baud }
          : s.status === 'connected'
          ? { ...s, status: 'disconnected' }
          : s,
      ),
    );
    setActiveScaleId(serialId);
    simulateNextAnimal();
  }, [simulateNextAnimal]);

  // Toggle sound
  const toggleSound = useCallback(() => {
    if (!activeScale) return;
    const nextVal = !activeScale.soundFeedback;
    setScales((prev) =>
      prev.map((s) => (s.id === activeScale.id ? { ...s, soundFeedback: nextVal } : s)),
    );
  }, [activeScale]);

  // Toggle RFID
  const toggleRFID = useCallback(() => {
    if (!activeScale) return;
    const nextVal = !activeScale.rfidConnected;
    setScales((prev) =>
      prev.map((s) => (s.id === activeScale.id ? { ...s, rfidConnected: nextVal } : s)),
    );
  }, [activeScale]);

  // Toggle unit
  const setUnit = useCallback((unit: 'kg' | 'lb') => {
    setReading((prev) => ({
      ...prev,
      unit,
      weight: unit === 'lb' ? Math.round(prev.weight * 2.20462 * 10) / 10 : Math.round((prev.weight / 2.20462) * 10) / 10,
    }));
  }, []);

  return {
    scales,
    activeScale,
    reading,
    isScanning,
    filterSensitivity,
    currentAnimalIndex,
    connectScale,
    disconnectScale,
    scanForBluetoothDevices,
    connectWifiScale,
    connectSerialScale,
    tareScale,
    lockCurrentWeight,
    unlockWeight,
    simulateNextAnimal,
    setPlatformEmpty,
    toggleSound,
    toggleRFID,
    setUnit,
    setFilterSensitivity,
    readRFIDTag,
  };
};
