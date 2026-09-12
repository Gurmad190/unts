import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface ProgramCardProps {
  title: string;
  description: string;
  category: string;
  slug?: string;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ title, description, category, slug }) => {
  const detailPath = slug ? `/academics/${slug}` : '/academics';

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col h-full group">
      <div className="p-6 flex-grow">
        <span className="text-xs font-bold text-uns-gold uppercase tracking-wider mb-2 block">{category}</span>
        <h3 className="text-lg font-bold text-uns-navy mb-3 group-hover:text-uns-gold transition-colors">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {description}
        </p>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <Link to={detailPath} className="text-uns-navy text-sm font-bold flex items-center hover:text-uns-gold transition-colors">
          Learn More <ArrowRight size={14} className="ml-1" />
        </Link>
        <Link to="/admissions" className="bg-uns-navy text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-900 transition-colors">
          Apply Now
        </Link>
      </div>
    </div>
  );
};

export default ProgramCard;
