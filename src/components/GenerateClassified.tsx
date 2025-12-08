import React, { useState, useRef, useEffect } from 'react';
import { Download, Eye, FileText, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';

const TEMPLATES = [
  {
    id: 1,
    name: 'Template 1',
    preview: '/categorydesigns/1.png',
    bgColor: '#FFFFFF',
    borderColor: '#000000',
    borderWidth: 2
  },
  {
    id: 2,
    name: 'Template 2',
    preview: '/categorydesigns/2.png',
    bgColor: '#F5F5F5',
    borderColor: '#333333',
    borderWidth: 3
  },
  {
    id: 3,
    name: 'Template 3',
    preview: '/categorydesigns/3.png',
    bgColor: '#FFFFFF',
    borderColor: '#666666',
    borderWidth: 2
  },
  {
    id: 4,
    name: 'Template 4',
    preview: '/categorydesigns/4.png',
    bgColor: '#FAFAFA',
    borderColor: '#000000',
    borderWidth: 3
  }
];

const WIDTH_PX = 680;
const HEIGHT_PX = 565;

const GenerateClassified: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [matter, setMatter] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [phoneLayout, setPhoneLayout] = useState<'vertical' | 'horizontal'>('vertical');
  const [isPreview, setIsPreview] = useState(false);
  const [matterFontSize, setMatterFontSize] = useState(36);
  const [titleFontSize, setTitleFontSize] = useState(56);
  const [phoneFontSize, setPhoneFontSize] = useState(40);
  const [titleMatterSpacing, setTitleMatterSpacing] = useState(10);
  const [matterPhoneSpacing, setMatterPhoneSpacing] = useState(30);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const phoneArray = phoneNumbers
    .split(/[,\n]/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  useEffect(() => {
    if (selectedTemplate && title) {
      generatePreview();
    }
  }, [selectedTemplate, title, matter, phoneNumbers, phoneLayout, isPreview, matterFontSize, titleFontSize, phoneFontSize, titleMatterSpacing, matterPhoneSpacing]);

  const calculateFontSize = (text: string, maxWidth: number, baseSize: number, isBold: boolean = true): number => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseSize;

    let fontSize = baseSize;
    ctx.font = isBold ? `bold ${fontSize}px Arial` : `${fontSize}px Arial`;

    while (ctx.measureText(text).width > maxWidth && fontSize > 10) {
      fontSize -= 0.5;
      ctx.font = isBold ? `bold ${fontSize}px Arial` : `${fontSize}px Arial`;
    }

    return fontSize;
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): number => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    const lines: string[] = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    lines.forEach(l => {
      ctx.fillText(l.trim(), x, currentY);
      currentY += lineHeight;
    });

    return currentY;
  };

  const generatePreview = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedTemplate) return;

    const template = TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return;

    canvas.width = WIDTH_PX;
    canvas.height = HEIGHT_PX;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = template.bgColor;
    ctx.fillRect(0, 0, WIDTH_PX, HEIGHT_PX);

    ctx.strokeStyle = template.borderColor;
    ctx.lineWidth = template.borderWidth * 3;
    ctx.strokeRect(
      template.borderWidth * 1.5,
      template.borderWidth * 1.5,
      WIDTH_PX - (template.borderWidth * 3),
      HEIGHT_PX - (template.borderWidth * 3)
    );

    const padding = 35;
    const contentWidth = WIDTH_PX - (padding * 2);
    const contentHeight = HEIGHT_PX - (padding * 2);

    let currentY = padding + 50;

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';

    const calculatedTitleFontSize = calculateFontSize(title, contentWidth, titleFontSize);
    ctx.font = `bold ${calculatedTitleFontSize}px Arial`;
    currentY = wrapText(ctx, title, WIDTH_PX / 2, currentY, contentWidth, calculatedTitleFontSize + 8);

    if (matter) {
      currentY += titleMatterSpacing;
      ctx.font = `${matterFontSize}px Arial`;
      currentY = wrapText(ctx, matter, WIDTH_PX / 2, currentY, contentWidth, matterFontSize + 8);
    }

    if (phoneArray.length > 0) {
      currentY += matterPhoneSpacing;

      if (phoneLayout === 'horizontal') {
        const phoneText = phoneArray.join(' / ');
        const calculatedPhoneFontSize = calculateFontSize(phoneText, contentWidth, phoneFontSize);
        ctx.font = `bold ${calculatedPhoneFontSize}px Arial`;
        ctx.fillText(phoneText, WIDTH_PX / 2, currentY);
      } else {
        phoneArray.forEach((phone, index) => {
          const calculatedPhoneFontSize = calculateFontSize(phone, contentWidth, phoneFontSize);
          ctx.font = `bold ${calculatedPhoneFontSize}px Arial`;
          ctx.fillText(phone, WIDTH_PX / 2, currentY);
          currentY += calculatedPhoneFontSize + 15;
        });
      }
    }

    if (isPreview) {
      ctx.save();
      ctx.translate(WIDTH_PX / 2, HEIGHT_PX / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.font = 'bold 70px Arial';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.textAlign = 'center';
      ctx.fillText('PREVIEW', 0, 0);
      ctx.restore();
    }

    setPreviewUrl(canvas.toDataURL('image/png'));
  };

  const handleExport = () => {
    if (!previewUrl) return;

    const link = document.createElement('a');
    link.download = `classified-${Date.now()}.png`;
    link.href = previewUrl;
    link.click();
  };

  const handleExportPDF = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const imgData = canvas.toDataURL('image/png');

    const widthInMM = 180;
    const heightInMM = (HEIGHT_PX / WIDTH_PX) * widthInMM;

    const pdf = new jsPDF({
      orientation: widthInMM > heightInMM ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [widthInMM, heightInMM]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, widthInMM, heightInMM);
    pdf.save(`classified-${Date.now()}.pdf`);
  };

  const handleReset = () => {
    setSelectedTemplate(null);
    setTitle('');
    setMatter('');
    setPhoneNumbers('');
    setPhoneLayout('vertical');
    setIsPreview(false);
    setMatterFontSize(36);
    setPreviewUrl(null);
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold">Generate Classified</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Template <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`relative border-2 rounded-lg p-3 transition-all ${
                        selectedTemplate === template.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="aspect-[6/5] bg-gray-100 rounded flex items-center justify-center mb-2">
                        <div
                          className="w-full h-full rounded"
                          style={{
                            backgroundColor: template.bgColor,
                            border: `${template.borderWidth}px solid ${template.borderColor}`
                          }}
                        />
                      </div>
                      <p className="text-sm font-medium text-center">{template.name}</p>
                      {selectedTemplate === template.id && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matter (Description)
                </label>
                <textarea
                  value={matter}
                  onChange={(e) => setMatter(e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title Font Size: {titleFontSize}px
                </label>
                <input
                  type="range"
                  min="30"
                  max="80"
                  value={titleFontSize}
                  onChange={(e) => setTitleFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Small (30px)</span>
                  <span>Large (80px)</span>
                </div>
              </div>

              {matter && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matter Font Size: {matterFontSize}px
                  </label>
                  <input
                    type="range"
                    min="16"
                    max="60"
                    value={matterFontSize}
                    onChange={(e) => setMatterFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Small (16px)</span>
                    <span>Large (60px)</span>
                  </div>
                </div>
              )}

              {matter && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spacing: Title to Matter: {titleMatterSpacing}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={titleMatterSpacing}
                    onChange={(e) => setTitleMatterSpacing(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>None (0px)</span>
                    <span>Large (80px)</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number(s)
                </label>
                <textarea
                  value={phoneNumbers}
                  onChange={(e) => setPhoneNumbers(e.target.value)}
                  placeholder="Enter phone numbers (one per line or comma-separated)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {phoneNumbers && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Font Size: {phoneFontSize}px
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="70"
                    value={phoneFontSize}
                    onChange={(e) => setPhoneFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Small (20px)</span>
                    <span>Large (70px)</span>
                  </div>
                </div>
              )}

              {phoneNumbers && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spacing: Matter to Phone: {matterPhoneSpacing}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={matterPhoneSpacing}
                    onChange={(e) => setMatterPhoneSpacing(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>None (0px)</span>
                    <span>Large (80px)</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number Layout
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="vertical"
                      checked={phoneLayout === 'vertical'}
                      onChange={(e) => setPhoneLayout(e.target.value as 'vertical' | 'horizontal')}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Vertical (one per line)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="horizontal"
                      checked={phoneLayout === 'horizontal'}
                      onChange={(e) => setPhoneLayout(e.target.value as 'vertical' | 'horizontal')}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Horizontal (separated by /)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPreview"
                  checked={isPreview}
                  onChange={(e) => setIsPreview(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPreview" className="ml-2 text-sm font-medium text-gray-700">
                  Add Preview Watermark
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={handleExport}
                  disabled={!previewUrl}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export as PNG</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={!previewUrl}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Export as PDF</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preview (680 × 565 pixels)
              </label>
              <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex flex-col items-center">
                  {selectedTemplate && title ? (
                    <>
                      <canvas
                        ref={canvasRef}
                        style={{
                          width: `${WIDTH_PX / 2}px`,
                          height: `${HEIGHT_PX / 2}px`,
                          border: '1px solid #ddd',
                          backgroundColor: '#fff'
                        }}
                        className="shadow-lg"
                      />
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                          Export Size: {WIDTH_PX} × {HEIGHT_PX} pixels
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Square format optimized for digital use
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                      <Eye className="h-16 w-16 mb-4" />
                      <p className="text-center">
                        Select a template and enter title to see preview
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Instructions:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Select a template design from the options above</li>
              <li>Enter the title (required) and optional description</li>
              <li>Add phone numbers (one per line or comma-separated)</li>
              <li>Font sizes automatically adjust based on content length</li>
              <li>Enable preview watermark for draft versions</li>
              <li>Export generates a PNG with exact dimensions: 680 × 565 pixels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateClassified;
