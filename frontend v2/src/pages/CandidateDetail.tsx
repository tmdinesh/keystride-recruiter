import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { apiService } from '../services/api';
import type { Candidate } from '../types';
import { cn } from '../utils/cn';
import { Toast } from '../components/ui/toast';

export const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToShortlist, setAddingToShortlist] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!id) return;
      try {
        const data = await apiService.getCandidate(id);
        setCandidate(data);
      } catch (error) {
        console.error('Failed to fetch candidate:', error);
        setToast({ message: 'Candidate not found', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [id]);

  const handleAddToShortlist = async () => {
    if (!id) return;
    setAddingToShortlist(true);
    try {
      await apiService.addToShortlist(id);
      setToast({ message: 'Added to shortlist successfully!', type: 'success' });
      if (candidate) {
        setCandidate({ ...candidate, shortlisted: true });
      }
    } catch (error) {
      setToast({ message: 'Failed to add to shortlist', type: 'error' });
    } finally {
      setAddingToShortlist(false);
    }
  };

  if (loading) {
    return <div className="space-y-6">Loading candidate details...</div>;
  }

  if (!candidate) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/candidates')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Candidates
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Candidate not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ScoreCircle = ({ value, label }: { value: number; label: string }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (value / 100) * circumference;
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={cn("transition-all duration-500", {
                "text-green-500": value >= 80,
                "text-yellow-500": value >= 60 && value < 80,
                "text-orange-500": value >= 40 && value < 60,
                "text-red-500": value < 40,
              })}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={cn("text-2xl font-bold", {
                "text-green-600": value >= 80,
                "text-yellow-600": value >= 60 && value < 80,
                "text-orange-600": value >= 40 && value < 60,
                "text-red-600": value < 40,
              })}>
                {value}%
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">{label}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={() => navigate('/candidates')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Candidates
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">{candidate.name}</h1>
          <p className="text-gray-500 mt-1">{candidate.id} • {candidate.email}</p>
        </div>
        <Button
          onClick={handleAddToShortlist}
          disabled={candidate.shortlisted || addingToShortlist}
          size="lg"
        >
          {candidate.shortlisted ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Shortlisted
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4 mr-2" />
              Add to Shortlist
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Score Breakdown */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overall Match Score</CardTitle>
              <CardDescription>Comprehensive candidate evaluation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <ScoreCircle value={candidate.matchScore} label="Overall Score" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Match Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Experience Match</span>
                  <span className="text-sm font-semibold text-gray-900">{candidate.experienceMatch}%</span>
                </div>
                <Progress value={candidate.experienceMatch} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Skill Match</span>
                  <span className="text-sm font-semibold text-gray-900">{candidate.skillMatch}%</span>
                </div>
                <Progress value={candidate.skillMatch} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Education Match</span>
                  <span className="text-sm font-semibold text-gray-900">{candidate.educationMatch}%</span>
                </div>
                <Progress value={candidate.educationMatch} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Analysis */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {candidate.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skill Gaps</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {candidate.skillGaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{gap}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 leading-relaxed">{candidate.summary}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interview Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Suggested Interview Questions</CardTitle>
          <CardDescription>AI-generated questions based on candidate profile</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 list-decimal list-inside">
            {candidate.interviewQuestions.map((question, idx) => (
              <li key={idx} className="text-sm text-gray-700 pl-2">
                {question}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Skill Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Match Comparison</CardTitle>
          <CardDescription>Detailed skill-by-skill analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">JD Required Skill</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate Has?</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Match Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {candidate.skillComparison.map((skill, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{skill.skill}</td>
                    <td className="px-4 py-3">
                      {skill.candidateHas ? (
                        <Badge variant="success">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="danger">
                          <XCircle className="h-3 w-3 mr-1" />
                          No
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={skill.matchScore} className="flex-1 max-w-[100px]" />
                        <span className="text-sm font-medium text-gray-900">{skill.matchScore}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
