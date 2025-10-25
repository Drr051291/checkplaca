interface CarBrandLogoProps {
  brandName: string;
  className?: string;
}

const CarBrandLogo = ({ brandName, className = "" }: CarBrandLogoProps) => {
  // Normalize brand name to match common formats
  const normalizeBrandName = (brand: string): string => {
    if (!brand) return "";
    
    const brandLower = brand.toLowerCase().trim();
    
    // Map common variations to standard names
    const brandMap: { [key: string]: string } = {
      'vw': 'volkswagen',
      'volks': 'volkswagen',
      'mercedes': 'mercedes-benz',
      'mercedes benz': 'mercedes-benz',
      'mb': 'mercedes-benz',
      'gm': 'chevrolet',
      'chevy': 'chevrolet',
      'ford/willys': 'ford',
      'ford willys': 'ford',
      'land rover': 'landrover',
      'jac': 'jac motors',
      'i/': '',
    };

    // Extract brand name from common patterns like "I/FORD F-350"
    let cleanBrand = brandLower.replace(/^i\//, '').split(/[\s\/-]/)[0];
    
    // Apply mapping
    cleanBrand = brandMap[cleanBrand] || cleanBrand;
    
    return cleanBrand;
  };

  const normalizedBrand = normalizeBrandName(brandName);
  
  if (!normalizedBrand) {
    return null;
  }

  // Use CDN logo service - Car Logos API
  const logoUrl = `https://cdn.imagin.studio/getImage?customer=br-carglass&make=${encodeURIComponent(normalizedBrand)}&angle=01&width=200`;
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src={logoUrl}
        alt={`Logo ${brandName}`}
        className="h-16 w-auto object-contain"
        onError={(e) => {
          // Fallback if logo not found - hide image
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};

export default CarBrandLogo;
