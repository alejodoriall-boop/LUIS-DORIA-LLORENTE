import React, { useState } from 'react';
import { parseGeoFileContent } from '../../utils/geoUtils';
import { PaddockGeo, FarmGeoProfile } from '../../types';
import {
  Upload,
  FileCode,
  X,
  CheckCircle2,
  AlertCircle,
  Layers,
  MapPin,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface KmlImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedPaddocks: PaddockGeo[], farmProfile?: Partial<FarmGeoProfile>) => void;
}

const SAMPLE_KML_DEMO = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Hacienda El Trébol - Potreros</name>
    <Placemark>
      <name>Potrero 01 - Vega de Río</name>
      <description>Brachiaria Brizantha 22 Ha</description>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              -75.882,8.759,0 -75.877,8.762,0 -75.874,8.756,0 -75.880,8.753,0 -75.882,8.759,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
    <Placemark>
      <name>Potrero 02 - Loma Los Cedros</name>
      <description>Mombasa Silvopastoril 18 Ha</description>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              -75.877,8.762,0 -75.869,8.763,0 -75.868,8.757,0 -75.874,8.756,0 -75.877,8.762,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>`;

export const KmlImportModal: React.FC<KmlImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedPaddocks, setParsedPaddocks] = useState<PaddockGeo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage('');
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setFileContent(text);
        const result = parseGeoFileContent(text, file.name);
        if (!result.success || result.detectedPaddocks.length === 0) {
          setErrorMessage(
            result.message ||
              'No se encontraron polígonos válidos en el archivo. Verifica que contenga polígonos cerrados en coordenadas WGS84.',
          );
          setParsedPaddocks([]);
        } else {
          setParsedPaddocks(result.detectedPaddocks as PaddockGeo[]);
        }
      } catch (err: any) {
        setErrorMessage(`Error al procesar el archivo: ${err.message || 'Formato no soportado'}`);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadDemo = () => {
    setFileName('hacienda_el_trebol_demo.kml');
    setFileContent(SAMPLE_KML_DEMO);
    const result = parseGeoFileContent(SAMPLE_KML_DEMO, 'hacienda_el_trebol_demo.kml');
    setParsedPaddocks(result.detectedPaddocks as PaddockGeo[]);
    setErrorMessage('');
  };

  const handleConfirmImport = () => {
    if (parsedPaddocks.length > 0) {
      const totalHa = parsedPaddocks.reduce((acc, p) => acc + p.areaHa, 0);
      onImportSuccess(parsedPaddocks, {
        name: fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        totalAreaHa: Number(totalHa.toFixed(1)),
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#15241C] rounded-3xl border border-white/10 card-shadow max-w-xl w-full overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="bg-[#123F2A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0D1A13] border border-[#2d6a4f] flex items-center justify-center text-[#ffba38]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white">
                Importar Georreferenciación (KML / GeoJSON)
              </h3>
              <p className="text-xs text-[#86af99]">
                Carga tu finca desde Google Earth, QGIS o GPS de campo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 bg-[#f9f9f9]">
          {/* Dropzone */}
          <div className="border-2 border-dashed border-[#2d6a4f] rounded-2xl p-6 bg-[#15241C] text-center hover:bg-[#c1ecd4]/10 transition-colors relative cursor-pointer">
            <input
              type="file"
              accept=".kml,.geojson,.json"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-[#c1ecd4] text-[#002114] flex items-center justify-center">
                <FileCode className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-white">
                {fileName ? fileName : 'Selecciona o arrastra tu archivo .KML o .GeoJSON'}
              </p>
              <p className="text-xs text-[#717973]">
                Formatos compatibles: Google Earth (.kml), GeoJSON (.geojson, .json) WGS84
              </p>
            </div>
          </div>

          {/* Quick Demo Template Option */}
          <div className="flex items-center justify-between p-3 bg-[#15241C] rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-white">¿No tienes un archivo KML a mano?</span>
            </div>
            <button
              onClick={handleLoadDemo}
              className="bg-[#123F2A] hover:bg-[#1F6547] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
            >
              Cargar Ejemplo KML
            </button>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-xl border border-[#ba1a1a] flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Preview of Detected Polygons */}
          {parsedPaddocks.length > 0 && (
            <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 card-shadow space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Polígonos Georreferenciados Encontrados ({parsedPaddocks.length})
                </span>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-[#c1ecd4] px-2 py-0.5 rounded">
                  {parsedPaddocks.reduce((sum, p) => sum + p.areaHa, 0).toFixed(1)} Ha Totales
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {parsedPaddocks.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#f3f3f3] text-xs border border-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="font-bold text-white">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[#717973]">
                      <span>{p.areaHa} Ha</span>
                      <span>{p.polygon.length} vértices</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#eeeeee] p-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-[#414844] hover:bg-[#15241C] transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={parsedPaddocks.length === 0}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              parsedPaddocks.length > 0
                ? 'bg-[#D4A94E] hover:bg-[#ffdeac] text-[#0D1A13] tactical-shadow cursor-pointer'
                : 'bg-black/10 text-black/30 cursor-not-allowed'
            }`}
          >
            <span>Cargar {parsedPaddocks.length} Potreros al SIG</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
