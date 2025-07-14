import React from 'react';

const HomePage = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        Welcome to AdopteUnEtudiant
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600">
        The platform that connects students with companies.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <a
          href="/offers"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Browse Offers
        </a>
        <a href="/register" className="text-sm font-semibold leading-6 text-gray-900">
          Get Started <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  );
};

export default HomePage; 