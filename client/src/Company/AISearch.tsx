import React, { useState } from "react";
import type { Candidate } from "../types";
import {
  Search,
  Bot,
  User,
  MapPin,
  Briefcase,
  Star,
  Mail,
  Download,
} from "lucide-react";

export const AISearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([
    "Frontend developer with React experience",
    "Senior AI/ML engineer with Python skills",
    "Full-stack developer in San Francisco",
    "Data scientist with 5+ years experience",
  ]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    // Simulate AI processing delay
    setTimeout(() => {
      const searchResults = searchCandidates(query, "1");
      setResults(searchResults);
      setLoading(false);

      // Add to search history
      if (!searchHistory.includes(query)) {
        setSearchHistory((prev) => [query, ...prev.slice(0, 9)]);
      }
    }, 1500);
  };

  const handleQuickSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setLoading(true);
    setTimeout(() => {
      const searchResults = searchCandidates(searchQuery, "1");
      setResults(searchResults);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          AI-Powered Candidate Search
        </h1>
        <p className="text-gray-600 mt-1">
          Use natural language to find the perfect candidates for your roles
        </p>
      </div>

      {/* Search Interface */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4 mb-4">
          <Bot className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              AI Search Assistant
            </h3>
            <p className="text-sm text-gray-600">
              Describe your ideal candidate in natural language
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Senior React developer with TypeScript experience in the Bay Area"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!query.trim() || loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Quick Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((historyQuery, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSearch(historyQuery)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {historyQuery}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Bot className="w-6 h-6 text-blue-600 animate-pulse" />
            <div className="flex space-x-1">
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
          <p className="text-gray-600">
            AI is analyzing candidate profiles and matching your requirements...
          </p>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({results.length} candidates found)
            </h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Export All
            </button>
          </div>

          {results.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {candidate.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {candidate.name}
                      </h4>
                      <p className="text-gray-600">{candidate.title}</p>
                    </div>
                    <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-medium">95% Match</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Experience
                      </p>
                      <div className="flex items-center text-gray-900">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {candidate.experience} years
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Location
                      </p>
                      <div className="flex items-center text-gray-900">
                        <MapPin className="w-4 h-4 mr-1" />
                        {candidate.location}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Education
                      </p>
                      <p className="text-gray-900">{candidate.education}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </p>
                    <p className="text-gray-600">{candidate.bio}</p>
                  </div>

                  {/* AI Insights */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="text-sm font-medium text-blue-900 mb-1">
                      AI Insights
                    </h5>
                    <p className="text-sm text-blue-800">
                      Strong match for frontend roles with{" "}
                      {candidate.experience}+ years of experience in React and
                      TypeScript. Profile shows consistent growth in technical
                      leadership.
                    </p>
                  </div>
                </div>

                <div className="ml-6 flex flex-col space-y-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Contact</span>
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Download Resume</span>
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    View Full Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {results.length === 0 && !loading && query && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No candidates found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or use different keywords
          </p>
          <button
            onClick={() => setQuery("")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Try a different search
          </button>
        </div>
      )}
    </div>
  );
};
