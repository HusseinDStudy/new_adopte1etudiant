// Example placeholder component with TailwindCSS

const OfferCard = () => {
  return (
    <div className="max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow duration-200 hover:shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h5 className="text-xl font-bold tracking-tight text-gray-900">
          Frontend Developer Intern
        </h5>
        <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
          Internship
        </span>
      </div>
      <p className="mb-2 font-normal text-gray-700">TechCorp Inc.</p>
      <p className="mb-3 text-sm text-gray-500">Paris, France</p>
      <div className="flex flex-wrap gap-2">
        {['React', 'TypeScript', 'TailwindCSS'].map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-800"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

export default OfferCard; 