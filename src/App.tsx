import React, { useState, useEffect } from 'react';
import { Subject, Topic, Subtopic } from './types';
import { subjects as initialSubjects } from './data/subjects';
import { SubjectCard } from './components/SubjectCard';
import { TeachingSpace } from './components/TeachingSpace';
import { ProgressTracker } from './components/ProgressTracker';
import { GraduationCap, ArrowLeft, Star } from 'lucide-react';

function App() {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedTopic(null);
    setSelectedSubtopic(null);
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setSelectedSubtopic(null);
  };

  const handleSubtopicSelect = (subtopic: Subtopic) => {
    setSelectedSubtopic(subtopic);
  };

  const handleComplete = (success: boolean, subtopicId: string) => {
    if (success) {
      setSubjects(prevSubjects => {
        return prevSubjects.map(subject => ({
          ...subject,
          topics: subject.topics.map(topic => ({
            ...topic,
            subtopics: topic.subtopics.map(subtopic => 
              subtopic.id === subtopicId
                ? { ...subtopic, completed: true, status: 'completed' as const }
                : subtopic
            ),
            completed: topic.subtopics.every(st => 
              st.id === subtopicId ? true : st.completed
            )
          }))
        }));
      });
    }
  };

  const handleUpdateStatus = (status: Subtopic['status']) => {
    if (!selectedSubtopic) return;
    
    setSubjects(prevSubjects => {
      return prevSubjects.map(subject => ({
        ...subject,
        topics: subject.topics.map(topic => ({
          ...topic,
          subtopics: topic.subtopics.map(subtopic => 
            subtopic.id === selectedSubtopic.id
              ? { ...subtopic, status }
              : subtopic
          )
        }))
      }));
    });
  };

  useEffect(() => {
    const getTitle = () => {
      if (!selectedSubject) {
        return 'TeachMe!';
      }
      
      if (!selectedTopic) {
        return `TeachMe! - ${selectedSubject.name}`;
      }

      if (!selectedSubtopic) {
        return `TeachMe! - ${selectedSubject.name} - ${selectedTopic.name}`;
      }

      return `TeachMe! - ${selectedSubject.name} - ${selectedTopic.name} - ${selectedSubtopic.name}`;
    };

    document.title = getTitle();
  }, [selectedSubject, selectedTopic, selectedSubtopic]);

  const handleBack = () => {
    if (selectedSubtopic) {
      setSelectedSubtopic(null);
    } else if (selectedTopic) {
      setSelectedTopic(null);
    } else if (selectedSubject) {
      setSelectedSubject(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-600">TeachMe!</h1>
              </div>
            </div>
            {(selectedSubject || selectedTopic || selectedSubtopic) && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {!selectedSubject ? (
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <h2 className="text-3xl font-bold text-gray-900">Choose Your Adventure!</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onClick={handleSubjectSelect}
                />
              ))}
            </div>
          </div>
        ) : !selectedTopic ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">{selectedSubject.name}</h2>
              <button
                onClick={() => setSelectedSubject(null)}
                className="button-bounce flex items-center space-x-2 px-6 py-3 bg-white text-indigo-600 rounded-xl shadow-md hover:bg-indigo-50"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-bold">Back to Adventures</span>
              </button>
            </div>
            <ProgressTracker topics={selectedSubject.topics} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {selectedSubject.topics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic)}
                  className="card-hover bg-white rounded-2xl shadow-lg p-8 cursor-pointer border-4 border-transparent hover:border-indigo-300"
                >
                  <h3 className="text-2xl font-bold text-gray-800">{topic.name}</h3>
                  <p className="text-lg text-gray-600 mt-4">{topic.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : !selectedSubtopic ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">{selectedTopic.name}</h2>
              <button
                onClick={() => setSelectedTopic(null)}
                className="button-bounce flex items-center space-x-2 px-6 py-3 bg-white text-indigo-600 rounded-xl shadow-md hover:bg-indigo-50"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-bold">Back to Topics</span>
              </button>
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">{selectedTopic.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedTopic.subtopics.map(subtopic => {
                  const isMastered = subtopic.status === 'mastered' && subtopic.isFundamental;
                  return (
                    <div
                      key={subtopic.id}
                      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all ${
                        isMastered ? 'ring-2 ring-green-500 relative overflow-hidden' : ''
                      }`}
                      onClick={() => handleSubtopicSelect(subtopic)}
                    >
                      {isMastered && (
                        <>
                          <div className="absolute top-0 right-0 -mt-1 -mr-1 transform rotate-12">
                            <div className="relative">
                              <Star className="w-12 h-12 text-yellow-400 fill-yellow-400 animate-pulse" />
                              <Star className="w-12 h-12 text-yellow-200 fill-yellow-200 absolute top-0 left-0 animate-ping" />
                            </div>
                          </div>
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-50 to-transparent opacity-50"></div>
                        </>
                      )}
                      <div className="flex items-center justify-between mb-2 relative">
                        <h3 className={`text-xl font-semibold ${
                          isMastered ? 'text-green-700' : 'text-gray-800'
                        }`}>
                          {subtopic.name}
                        </h3>
                        {isMastered && (
                          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                            <Star className="w-4 h-4 fill-yellow-400" />
                            Mastered!
                          </div>
                        )}
                      </div>
                      <p className={`${isMastered ? 'text-green-600' : 'text-gray-600'} mb-4`}>
                        {subtopic.description}
                      </p>
                      <div className="flex items-center text-sm">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          subtopic.status === 'mastered' ? 'bg-yellow-400' :
                          subtopic.status === 'completed' ? 'bg-blue-500' :
                          subtopic.status === 'in_progress' ? 'bg-yellow-500' :
                          'bg-gray-300'
                        }`}></span>
                        <span className={
                          subtopic.status === 'mastered' ? 'text-yellow-600 font-medium' :
                          subtopic.status === 'completed' ? 'text-blue-600' :
                          subtopic.status === 'in_progress' ? 'text-yellow-600' :
                          'text-gray-500'
                        }>
                          {subtopic.status === 'mastered' ? 'Mastered!' :
                           subtopic.status === 'completed' ? 'Completed' :
                           subtopic.status === 'in_progress' ? 'In Progress' :
                           'Not Started'}
                        </span>
                        {subtopic.status === 'mastered' && (
                          <Star className="w-4 h-4 ml-1 text-yellow-400 fill-yellow-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">{selectedSubtopic.name}</h2>
              <button
                onClick={() => setSelectedSubtopic(null)}
                className="button-bounce flex items-center space-x-2 px-6 py-3 bg-white text-indigo-600 rounded-xl shadow-md hover:bg-indigo-50"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-bold">Back to Challenges</span>
              </button>
            </div>
            <TeachingSpace
              subtopic={selectedSubtopic}
              onComplete={(success) => handleComplete(success, selectedSubtopic.id)}
              onUpdateStatus={handleUpdateStatus}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;