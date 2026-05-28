'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  getTrips, 
  getTags, 
  createTag, 
  saveFollowUp, 
  assignAgent, 
  archiveTrip 
} from '../../lib/api';

type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
};

type Tag = {
  id: number;
  name: string;
  color: string;
};

type FollowUp = {
  id: number;
  due_date: string;
  note: string;
  is_completed: boolean;
  created_at: string;
  agent_details?: User;
};

type Trip = {
  id: number;
  primary_contact_name: string;
  phone: string;
  email: string;
  origin?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  status: 'NEW' | 'IN_PROGRESS' | 'ON_HOLD' | 'CONVERTED' | 'ARCHIVED';
  assigned_agent_details?: User;
  tags: number[];
  tags_details?: Tag[];
  follow_ups: FollowUp[];
  due_date?: string;
  created_at: string;
};

const MOCK_AGENTS = [
  { id: 1, first_name: 'Aalok', last_name: 'Sharma' },
  { id: 2, first_name: 'Amit', last_name: 'Kumar' },
  { id: 3, first_name: 'Jane', last_name: 'Doe' },
];

export default function TripPlanRequests() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tagsList, setTagsList] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePopoverRow, setActivePopoverRow] = useState<number | null>(null);
  
  // Followups Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [followupNote, setFollowupNote] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Assign Modal states
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTrip, setAssignTrip] = useState<Trip | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<number>(0);

  // Click outside references
  const popoverRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const suggestionsRef = useRef<HTMLDivElement | null>(null);

  // Load Real Data on mount
  useEffect(() => {
    Promise.all([getTrips(), getTags()])
      .then(([tripsRes, tagsRes]) => {
        setTrips(tripsRes.data);
        setTagsList(tagsRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch data from API:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activePopoverRow !== null) {
        const currentRef = popoverRefs.current[activePopoverRow];
        if (currentRef && !currentRef.contains(event.target as Node)) {
          setActivePopoverRow(null);
        }
      }
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePopoverRow]);

  const handleOpenEditModal = (trip: Trip) => {
    setCurrentTrip(trip);
    setSelectedTags(trip.tags_details || []);
    
    // Sort follow ups by due date to get the upcoming/latest one
    const latestFollowUp = trip.follow_ups && trip.follow_ups.length > 0 ? trip.follow_ups[0] : null;
    setFollowupNote(latestFollowUp ? latestFollowUp.note : '');
    
    if (latestFollowUp) {
      const date = new Date(latestFollowUp.due_date);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
      setDueDate(localISOTime);
    } else {
      setDueDate('');
    }
    
    setModalOpen(true);
    setActivePopoverRow(null);
  };

  const handleSaveFollowups = () => {
    if (!currentTrip) return;

    const tagIds = selectedTags.map(t => t.id);
    const formattedDueDate = new Date(dueDate).toISOString();

    saveFollowUp(currentTrip.id, {
      tags: tagIds,
      note: followupNote,
      due_date: formattedDueDate
    })
      .then((res) => {
        const updatedTrip = res.data;
        // Update trips list in state
        setTrips(trips.map(t => t.id === updatedTrip.id ? updatedTrip : t));
        setModalOpen(false);
      })
      .catch((err) => {
        console.error('Failed to save follow-ups:', err);
        alert('Error saving follow-up notes: ' + (err.response?.data?.detail || err.message));
      });
  };

  const handleArchiveRequest = (tripId: number) => {
    if (confirm('Are you sure you want to archive this request?')) {
      archiveTrip(tripId)
        .then(() => {
          // Remove archived trip from local requests view
          setTrips(trips.filter(t => t.id !== tripId));
        })
        .catch((err) => {
          console.error('Failed to archive request:', err);
          alert('Failed to archive request.');
        });
    }
    setActivePopoverRow(null);
  };

  const handleOpenAssignModal = (trip: Trip) => {
    setAssignTrip(trip);
    setSelectedAgentId(trip.assigned_agent_details?.id || 0);
    setAssignModalOpen(true);
    setActivePopoverRow(null);
  };

  const handleSaveAssign = () => {
    if (!assignTrip || !selectedAgentId) return;

    assignAgent(assignTrip.id, selectedAgentId)
      .then((res) => {
        const updatedTrip = res.data;
        setTrips(trips.map(t => t.id === updatedTrip.id ? updatedTrip : t));
        setAssignModalOpen(false);
      })
      .catch((err) => {
        console.error('Failed to assign agent:', err);
        alert('Failed to assign team agent.');
      });
  };

  const getInitials = (agent?: User) => {
    if (!agent) return 'U';
    return `${agent.first_name?.[0] || agent.username?.[0] || ''}${agent.last_name?.[0] || ''}`.toUpperCase();
  };

  // Helper to format creation text relative to now
  const getCreatedText = (createdAt: string, agentName: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.round(diffMs / (60 * 1000));
    const diffHours = Math.round(diffMs / (60 * 60 * 1000));

    let timeText = 'in a few seconds';
    if (diffMins >= 1 && diffMins < 60) {
      timeText = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours >= 1 && diffHours < 24) {
      timeText = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffHours >= 24) {
      const diffDays = Math.round(diffHours / 24);
      timeText = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }

    return `${timeText} by ${agentName}`;
  };

  // Helper to format due dates dynamically with Urgency alerts
  const renderFollowupDue = (followup: FollowUp, agentName: string) => {
    const now = new Date();
    const due = new Date(followup.due_date);
    const diffMs = due.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / (60 * 1000));
    const diffHours = Math.round(diffMs / (60 * 60 * 1000));
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

    let dueText = '';
    let isUrgent = false;

    if (diffMs < 0) {
      isUrgent = true;
      const absMins = Math.abs(diffMins);
      if (absMins < 60) {
        dueText = `Due ${absMins} minutes ago`;
      } else if (Math.abs(diffHours) < 24) {
        dueText = `Due ${Math.abs(diffHours)} hours ago`;
      } else {
        dueText = `Due ${Math.abs(diffDays)} days ago`;
      }
    } else {
      if (diffMins < 5) {
        dueText = `Due in a few seconds`;
        isUrgent = true;
      } else if (diffMins < 60) {
        dueText = `Due in ${diffMins} minutes`;
        isUrgent = true;
      } else if (diffHours < 24) {
        dueText = `Due in ${diffHours} hours`;
        isUrgent = true;
      } else {
        dueText = `Due in ${diffDays} days`;
      }
    }

    const createdDetails = getCreatedText(followup.created_at, agentName);

    return (
      <span className={`followup-due-date ${isUrgent ? 'due-date-urgent' : ''}`}>
        {createdDetails} • {dueText}
      </span>
    );
  };

  // Autocomplete suggestions search
  const filteredSuggestions = tagsList.filter(
    tag => tag.name.toLowerCase().includes(tagInput.toLowerCase()) && 
    !selectedTags.some(t => t.id === tag.id)
  );

  const handleAddTag = (tag: Tag) => {
    if (!selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput('');
    setShowSuggestions(false);
  };

  const handleRemoveTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter(t => t.id !== tagId));
  };

  const handleCreateCustomTag = () => {
    const cleanTagName = tagInput.trim().toUpperCase();
    if (!cleanTagName) return;

    const matched = tagsList.find(t => t.name.toUpperCase() === cleanTagName);
    if (matched) {
      handleAddTag(matched);
      return;
    }

    // Call POST /api/tags/
    createTag({ name: cleanTagName, color: '#f3f4f6' })
      .then((res) => {
        const newTagObj = res.data;
        setTagsList([...tagsList, newTagObj]);
        setSelectedTags([...selectedTags, newTagObj]);
        setTagInput('');
        setShowSuggestions(false);
      })
      .catch((err) => {
        console.error('Failed to create custom tag:', err);
      });
  };

  const displayTrips = trips.filter(t => t.status !== 'ARCHIVED');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div style={{ fontSize: '16px', color: 'var(--text-muted)' }}>Loading requests pipeline...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="requests-header">
        <h1 className="requests-title">Trip Plan Requests</h1>
      </div>

      <div className="table-card">
        {displayTrips.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No requests found in pipeline.
          </div>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Contact</th>
                <th style={{ width: '25%' }}>Travel Details</th>
                <th style={{ width: '35%' }}>Tags and Follow-Ups</th>
                <th style={{ width: '15%' }}>Team</th>
                <th style={{ width: '5%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayTrips.map(trip => {
                // followups are ordered by due date, pick first (earliest)
                const latestFollowUp = trip.follow_ups && trip.follow_ups.length > 0 ? trip.follow_ups[0] : null;
                const agentName = trip.assigned_agent_details?.first_name || trip.assigned_agent_details?.username || 'Aalok';
                
                return (
                  <tr key={trip.id}>
                    {/* Contact Column */}
                    <td>
                      <div className="contact-cell">
                        <span className="contact-name">{trip.primary_contact_name}</span>
                        <span className="contact-sub">{trip.phone}</span>
                        <span className="contact-sub">{trip.email}</span>
                      </div>
                    </td>

                    {/* Travel Details Column */}
                    <td>
                      <div className="details-cell">
                        <span className="details-destination">{trip.origin || 'TBD'} → {trip.destination || 'TBD'}</span>
                        <span className="details-dates">{trip.start_date || 'TBD'} - {trip.end_date || 'TBD'}</span>
                        <span className={`badge-status ${trip.status.toLowerCase()}`}>
                          {trip.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>

                    {/* Tags and Follow-Ups Custom Renderer */}
                    <td>
                      <div className="followups-cell">
                        {trip.tags_details && trip.tags_details.length > 0 && (
                          <div className="tags-row">
                            {trip.tags_details.map(tag => (
                              <span key={tag.id} className="tag-badge" style={{ borderColor: tag.color, color: tag.color }}>
                                [{tag.name}]
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {latestFollowUp ? (
                          <>
                            <div className="followup-note" title={latestFollowUp.note}>
                              {latestFollowUp.note}
                            </div>
                            {renderFollowupDue(latestFollowUp, agentName)}
                          </>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            No pending follow-ups
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Team Column */}
                    <td>
                      <div className="team-cell">
                        <div className="agent-avatar">
                          {getInitials(trip.assigned_agent_details)}
                        </div>
                        <span className="agent-name">
                          {trip.assigned_agent_details 
                            ? `${trip.assigned_agent_details.first_name || trip.assigned_agent_details.username} ${trip.assigned_agent_details.last_name || ''}`.trim()
                            : 'Unassigned'}
                        </span>
                      </div>
                    </td>

                    {/* Popover Actions Column */}
                    <td className="action-cell">
                      <div 
                        ref={el => { popoverRefs.current[trip.id] = el; }}
                        style={{ display: 'inline-block' }}
                      >
                        <button 
                          className="btn-icon"
                          onClick={() => setActivePopoverRow(activePopoverRow === trip.id ? null : trip.id)}
                        >
                          ⋮
                        </button>

                        {activePopoverRow === trip.id && (
                          <div className="popover-menu">
                            <button 
                              className="popover-item"
                              onClick={() => handleOpenEditModal(trip)}
                            >
                              Edit Tags and Follow-Ups
                            </button>
                            <button 
                              className="popover-item"
                              onClick={() => handleOpenAssignModal(trip)}
                            >
                              Assign Team
                            </button>
                            <button 
                              className="popover-item danger"
                              onClick={() => handleArchiveRequest(trip.id)}
                            >
                              Archive Request
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Tags and Follow-Ups Modal */}
      {modalOpen && currentTrip && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Tags and Follow-Ups</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Autocomplete / Multi-select Tag component */}
              <div className="form-group">
                <label className="form-label">Tags</label>
                <div className="tag-autocomplete" ref={suggestionsRef}>
                  <div className="tag-select-box" onClick={() => setShowSuggestions(true)}>
                    {selectedTags.map(tag => (
                      <span key={tag.id} className="tag-pill-interactive" style={{ color: tag.color, borderColor: tag.color }}>
                        [{tag.name}]
                        <button 
                          className="tag-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTag(tag.id);
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input 
                      type="text"
                      className="tag-select-input"
                      placeholder={selectedTags.length === 0 ? "Select or type to create tags..." : ""}
                      value={tagInput}
                      onChange={(e) => {
                        setTagInput(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (tagInput.trim()) {
                            const matchedSuggestion = tagsList.find(
                              s => s.name.toLowerCase() === tagInput.trim().toLowerCase()
                            );
                            if (matchedSuggestion) {
                              handleAddTag(matchedSuggestion);
                            } else {
                              handleCreateCustomTag();
                            }
                          }
                        }
                      }}
                    />
                  </div>

                  {showSuggestions && (tagInput || filteredSuggestions.length > 0) && (
                    <div className="tag-suggestions">
                      {filteredSuggestions.map(tag => (
                        <div 
                          key={tag.id}
                          className="tag-suggestion-item"
                          onClick={() => handleAddTag(tag)}
                        >
                          {tag.name}
                        </div>
                      ))}
                      {tagInput.trim() && !tagsList.some(t => t.name.toLowerCase() === tagInput.trim().toLowerCase()) && (
                        <div 
                          className="tag-suggestion-item create-new"
                          onClick={handleCreateCustomTag}
                        >
                          Create Tag &quot;{tagInput.trim().toUpperCase()}&quot;
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Textarea for Follow-up Note */}
              <div className="form-group">
                <label className="form-label">Follow-up Note</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '120px', resize: 'vertical' }}
                  maxLength={500}
                  value={followupNote}
                  onChange={(e) => setFollowupNote(e.target.value)}
                  placeholder="Enter follow-up details..."
                />
                <div className="char-counter">
                  {followupNote.length}/500 characters
                </div>
              </div>

              {/* DateTime Picker for Due Date */}
              <div className="form-group">
                <label className="form-label">Due Date &amp; Time</label>
                <input 
                  type="datetime-local"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button 
                className="btn-save" 
                onClick={handleSaveFollowups}
                disabled={!dueDate || !followupNote.trim()}
                style={{ opacity: (!dueDate || !followupNote.trim()) ? 0.6 : 1 }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Agent Modal */}
      {assignModalOpen && assignTrip && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Assign Agent</h3>
              <button className="modal-close" onClick={() => setAssignModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Agent</label>
                <select 
                  className="form-input"
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(Number(e.target.value))}
                >
                  <option value={0}>Unassigned</option>
                  {MOCK_AGENTS.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.first_name} {agent.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setAssignModalOpen(false)}>Cancel</button>
              <button 
                className="btn-save" 
                onClick={handleSaveAssign}
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
