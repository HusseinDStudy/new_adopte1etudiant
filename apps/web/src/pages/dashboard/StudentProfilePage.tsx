import React from 'react';
import SidebarLayout from '../../components/layout/SidebarLayout';
import { Field, Label } from '../../components/form/Field';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';

const StudentProfilePage: React.FC = () => {
  return (
    <SidebarLayout>
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
            <p className="mt-2 text-gray-600">
              Gérez vos informations personnelles et professionnelles
            </p>
          </div>

          {/* Profile Form */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Informations personnelles</h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field className="space-y-1">{({ id }) => (
                  <>
                    <Label>Prénom</Label>
                    <Input id={id} uiSize="lg" placeholder="Votre prénom" />
                  </>
                )}</Field>
                
                <Field className="space-y-1">{({ id }) => (
                  <>
                    <Label>Nom</Label>
                    <Input id={id} uiSize="lg" placeholder="Votre nom" />
                  </>
                )}</Field>
              </div>

              <Field className="space-y-1">{({ id }) => (
                <>
                  <Label>Email</Label>
                  <Input id={id} uiSize="lg" type="email" placeholder="votre.email@exemple.com" />
                </>
              )}</Field>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field className="space-y-1">{({ id }) => (
                  <>
                    <Label>École/Université</Label>
                    <Input id={id} uiSize="lg" placeholder="Nom de votre établissement" />
                  </>
                )}</Field>
                
                <Field className="space-y-1">{({ id }) => (
                  <>
                    <Label>Niveau d'études</Label>
                    <Select id={id} uiSize="lg" defaultValue="">
                      <option value="" disabled>Sélectionnez votre niveau</option>
                      <option>Bac+2 (BTS, DUT)</option>
                      <option>Bac+3 (Licence)</option>
                      <option>Bac+4 (Master 1)</option>
                      <option>Bac+5 (Master 2)</option>
                      <option>Bac+8 (Doctorat)</option>
                    </Select>
                  </>
                )}</Field>
              </div>

              <div>
                <Field className="space-y-2">{({ id }) => (
                  <>
                    <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700">
                      Compétences
                    </label>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {['React', 'TypeScript', 'Node.js', 'Python', 'SQL'].map((skill) => (
                        <span key={skill} className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                          {skill}
                          <button className="ml-2 text-blue-600 hover:text-blue-800" type="button">×</button>
                        </span>
                      ))}
                    </div>
                    <Input id={id} uiSize="lg" placeholder="Ajouter une compétence..." />
                  </>
                )}</Field>
              </div>

              <div>
                <Field className="space-y-1">{({ id }) => (
                  <>
                    <Label>Bio / Présentation</Label>
                    <textarea
                      id={id}
                      rows={4}
                      className="w-full rounded-lg border border-neutral-200 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2"
                      placeholder="Présentez-vous en quelques mots..."
                    />
                  </>
                )}</Field>
              </div>

              <div>
                <label htmlFor="cv-file" className="mb-2 block text-sm font-medium text-gray-700">
                  CV (PDF)
                </label>
                <input id="cv-file" type="file" accept="application/pdf" className="sr-only" />
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center" aria-describedby="cv-desc">
                  <svg className="mx-auto mb-4 h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p id="cv-desc" className="mb-2 text-gray-600">Glissez-déposez votre CV ou cliquez pour sélectionner</p>
                  <label htmlFor="cv-file" className="cursor-pointer font-medium text-blue-600 hover:text-blue-700">
                    Parcourir les fichiers
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default StudentProfilePage;
