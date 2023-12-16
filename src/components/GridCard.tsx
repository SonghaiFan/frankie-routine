import { categoriesToColorClass } from "@/utils/config";

interface GridCardProps {
  categories: "播种" | "收割" | "疏苗" | "风干";
  description: string;
  detail: string;
  number: string;
}

const GridCard: React.FC<GridCardProps> = ({
  categories,
  description,
  detail,
  number,
}) => {
  const colorClass = categoriesToColorClass[categories] || "bg-gray-500"; // Default color

  return (
    <div
      className={`bg-${colorClass} text-white p-4 relative rounded-lg shadow-lg`}
    >
      <div className="text-4xl font-bold mb-2">{categories}</div>
      <div className="mb-1">{description}</div>
      <div className="text-xs opacity-50 mb-1">{detail}</div>
      <span className="text-6xl absolute right-2 bottom-2 opacity-20">
        {number}
      </span>
    </div>
  );
};

export default GridCard;
