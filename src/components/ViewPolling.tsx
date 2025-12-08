import React from 'react';
import { X, BarChart3, Users, TrendingUp, Clock } from 'lucide-react';

interface PollOption {
  _id: string;
  option: string;
  votes: number;
  percentage: number;
}

interface VoteLog {
  _id: string;
  userId: string;
  selectedOptionIndex: number;
  votedAt: string;
}

interface ViewPollingProps {
  poll: {
    _id: string;
    question: string;
    options: PollOption[];
    isActive: boolean;
    votesLog: VoteLog[];
    createdAt: string;
    updatedAt: string;
  };
  onClose: () => void;
}

const ViewPolling: React.FC<ViewPollingProps> = ({ poll, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalVotes = () => {
    return poll.options.reduce((total, option) => total + option.votes, 0);
  };

  const getTopOption = () => {
    if (poll.options.length === 0) return null;
    return poll.options.reduce((top, option) => 
      option.votes > top.votes ? option : top
    );
  };

  const getRecentVotes = () => {
    return poll.votesLog
      .sort((a, b) => new Date(b.votedAt).getTime() - new Date(a.votedAt).getTime())
      .slice(0, 10);
  };

  const totalVotes = getTotalVotes();
  const topOption = getTopOption();
  const recentVotes = getRecentVotes();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-black shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-black px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Poll Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Question and Status */}
          <div className="border-b border-black pb-4">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900 flex-1">{poll.question}</h1>
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium border ${
                poll.isActive
                  ? 'bg-green-100 text-green-800 border-green-800'
                  : 'bg-gray-100 text-gray-800 border-gray-800'
              } ml-4`}>
                {poll.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Total Votes</p>
                  <p className="text-2xl font-bold text-blue-900">{totalVotes}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Leading Option</p>
                  <p className="text-lg font-bold text-green-900">
                    {topOption ? `${topOption.percentage.toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">Options</p>
                  <p className="text-2xl font-bold text-purple-900">{poll.options.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Poll Results */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Poll Results</h3>
            <div className="space-y-4">
              {poll.options.map((option, index) => (
                <div key={option._id} className="border border-black p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 border border-black rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {index + 1}
                      </div>
                      <span className="text-lg font-medium text-gray-900">{option.option}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{option.votes} votes</div>
                      <div className="text-sm text-gray-600">{option.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 border border-black h-4 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black transition-all duration-300"
                      style={{ width: `${option.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Voting Activity */}
          {recentVotes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Voting Activity</h3>
              <div className="bg-gray-50 border border-black p-4 rounded-lg">
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {recentVotes.map((vote) => {
                    const selectedOption = poll.options[vote.selectedOptionIndex];
                    return (
                      <div key={vote._id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">
                            User voted for "{selectedOption?.option || 'Unknown option'}"
                          </span>
                        </div>
                        <span className="text-gray-500">
                          {formatDate(vote.votedAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 border border-black p-4 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Created</h3>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(poll.createdAt)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Last Updated</h3>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(poll.updatedAt)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Poll ID</h3>
              <p className="mt-1 text-sm text-gray-900 font-mono">
                {poll._id}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Total Participants</h3>
              <p className="mt-1 text-sm text-gray-900">
                {poll.votesLog.length} unique voters
              </p>
            </div>
          </div>

          {/* Poll Information */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Poll Information
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    This poll allows users to vote on the given question. Each user can vote only once,
                    and results are updated in real-time. The poll can be activated or deactivated
                    to control when users can participate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-black p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-black text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPolling;