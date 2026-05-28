'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type Agent = {
  id: number;
  first_name: string;
  last_name: string;
};

type FollowUp = {
  id: number;
  scheduled_date: string;
  note: string;
  is_completed: boolean;
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
  status: 'NEW' | 'IN_PROGRESS' | 'ON_HOLD' | 'CONVERTED';
  assigned_agent_details?: Agent;
  tags: string[];
  follow_ups: FollowUp[];
};

// Initial Mock Data
const INITIAL_TRIPS: Trip[] = [
  {
    id: 1,
    primary_contact_name: 'Aalok Sharma',
    phone: '+91 98765 43210',
    email: 'aalok.sharma@example.com',
    origin: 'Delhi',
    destination: 'Maldives',
    start_date: '2026-06-15',
    end_date: '2026-06-22',
    status: 'NEW',
    assigned_agent_details: { id: 1, first_name: 'Aalok', last_name: 'Sharma' },
    tags: ['CNP', 'VIP'],
    follow_ups: [
      {
        id: 101,
        scheduled_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        note: 'Call client to confirm hotel preferences for the beach villa option.',
        is_completed: false,
      }
    ]
  },
  {
    id: 2,
    primary_contact_name: 'Rohan Gupta',
    phone: '+91 99999 88888',
    email: 'rohan.gupta@example.com',
    origin: 'Mumbai',
    destination: 'Swiss Alps',
    start_date: '2026-09-01',
    end_date: '2026-09-10',
    status: 'IN_PROGRESS',
    assigned_agent_details: { id: 2, first_name: 'Amit', last_name: 'Kumar' },
    tags: ['REVISIT'],
    follow_ups: [
      {
        id: 102,
        scheduled_date: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
        note: 'Email sent, awaiting passport copy scans from companions.',
        is_completed: false,
      }
    ]
  },
  {
    id: 3,
    primary_contact_name: 'Tech Corp Group',
    phone: '+91 91234 56789',
    email: 'events@techcorp.com',
    origin: 'Bangalore',
    destination: 'Goa',
    start_date: '2026-08-10',
    end_date: '2026-08-15',
    status: 'ON_HOLD',
    assigned_agent_details: { id: 3, first_name: 'Jane', last_name: 'Doe' },
    tags: ['CORPORATE'],
    follow_ups: [
      {
        id: 103,
        scheduled_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        note: 'Follow up after board meeting decision on team budget approval.',
        is_completed: false,
      }
    ]
  },
  {
    id: 4,
    primary_contact_name: 'Karan Johar',
    phone: '+91 88888 77777',
    email: 'karan@dharmaprod.com',
    origin: 'Mumbai',
    destination: 'London',
    start_date: '2026-07-05',
    end_date: '2026-07-15',
    status: 'CONVERTED',
    assigned_agent_details: { id: 1, first_name: 'Aalok', last_name: 'Sharma' },
    tags: ['VIP', 'CNP'],
    follow_ups: [
      {
        id: 104,
        scheduled_date: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 mins from now
        note: 'Discuss flight availability for the business class upgrades.',
        is_completed: false,
      }
    ]
  }
];

const PREDEFINED_TAGS = ['CNP', 'VIP', 'REVISIT', 'CORPORATE', 'HOT-LEAD', 'BUDGET'];

export default function TripPlanRequests() {
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [activePopoverRow, setActivePopoverRow] = useState<number | null>(null);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [followupNote, setFollowupNote] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>(PREDEFINED_TAGS);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Click outside references for closing menus
  const popoverRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const suggestionsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Close popover
      if (activePopoverRow !== null) {
        const currentRef = popoverRefs.current[activePopoverRow];
        if (currentRef && !currentRef.contains(event.target as Node)) {
          setActivePopoverRow(null);
        }
      }
      // Close suggestions
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePopoverRow]);

  const handleOpenEditModal = (trip: Trip) => {
    setCurrentTrip(trip);
    setSelectedTags(trip.tags);
    
    const latestFollowUp = trip.follow_ups[0];
    setFollowupNote(latestFollowUp ? latestFollowUp.note : '');
    
    if (latestFollowUp) {
      // Format to datetime-local expected string: YYYY-MM-DDTHH:MM
      const date = new Date(latestFollowUp.scheduled_date);
      const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
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

    // Simulate updating the trip object
    const updatedTrips = trips.map(t => {
      if (t.id === currentTrip.id) {
        const updatedFollowups = [...t.follow_ups];
        if (updatedFollowups.length > 0) {
          updatedFollowups[0] = {
            ...updatedFollowups[0],
            note: followupNote,
            scheduled_date: new Date(dueDate).toISOString()
          };
        } else {
          updatedFollowups.push({
            id: Date.now(),
            note: followupNote,
            scheduled_date: new Date(dueDate).toISOString(),
            is_completed: false
          });
        }

        return {
          ...t,
          tags: selectedTags,
          follow_ups: updatedFollowups
        };
      }
      return t;
    });

    setTrips(updatedTrips);
    setModalOpen(false);
    
    // In future this will trigger POST `/api/trips/${currentTrip.id}/followups`
    console.log('Saved data:', {
      tripId: currentTrip.id,
      tags: selectedTags,
      note: followupNote,
      due_date: dueDate
    });
  };

  const handleArchiveRequest = (tripId: number) => {
    if (confirm('Are you sure you want to archive this trip request?')) {
      setTrips(trips.filter(t => t.id !== tripId));
    }
    setActivePopoverRow(null);
  };

  const handleAssignTeam = (tripId: number) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const name = prompt('Enter agent name to assign:', trip.assigned_agent_details?.first_name || '');
    if (name) {
      setTrips(trips.map(t => {
        if (t.id === tripId) {
          return {
            ...t,
            assigned_agent_details: {
              id: t.assigned_agent_details?.id || Date.now(),
              first_name: name,
              last_name: ''
            }
          };
        }
        return t;
      }));
    }
    setActivePopoverRow(null);
  };

  // Helper for agent initials
  const getInitials = (agent?: Agent) => {
    if (!agent) return 'U';
    return `${agent.first_name[0] || ''}${agent.last_name[0] || ''}`.toUpperCase();
  };

  // Helper to format due dates dynamically with Urgency alerts
  const renderFollowupDue = (scheduledDate: string, agentName: string) => {
    const now = new Date();
    const due = new Date(scheduledDate);
    const diffMs = due.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / (60 * 1000));
    const diffHours = Math.round(diffMs / (60 * 60 * 1000));
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

    let dueText = '';
    let isUrgent = false;

    if (diffMs < 0) {
      // Past due
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
      // Upcoming due
      if (diffMins < 5) {
        dueText = `Due in a few seconds`;
        isUrgent = true;
      } else if (diffMins < 60) {
        dueText = `Due in ${diffMins} minutes`;
        isUrgent = true;
      } else if (diffHours < 24) {
        dueText = `Due in ${diffHours} hours`;
        isUrgent = true; // Still urgent if within the same day
      } else {
        dueText = `Due in ${diffDays} days`;
      }
    }

    return (
      <span className={`followup-due-date ${isUrgent ? 'due-date-urgent' : ''}`}>
        in a few seconds by {agentName || 'Aalok'} • {dueText}
      </span>
    );
  };

  // Autocomplete suggestions search
  const filteredSuggestions = tagSuggestions.filter(
    tag => tag.toLowerCase().includes(tagInput.toLowerCase()) && !selectedTags.includes(tag)
  );

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput('');
    setShowSuggestions(false);
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleCreateCustomTag = () => {
    const cleanTag = tagInput.trim().toUpperCase();
    if (cleanTag && !selectedTags.includes(cleanTag)) {
      setSelectedTags([...selectedTags, cleanTag]);
      if (!tagSuggestions.includes(cleanTag)) {
        setTagSuggestions([...tagSuggestions, cleanTag]);
      }
    }
    setTagInput('');
    setShowSuggestions(false);
  };

  return (
    <div>
      <div className="requests-header">
        <h1 className="requests-title">Trip Plan Requests</h1>
        <button className="btn-primary" onClick={() => {
          alert('Lead creation features are managed under pipeline. This view lists raw/automated requests.');
        }}>+ New Request</button>
      </div>

      <div className="table-card">
        <table className="requests-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Contact</th>
              <th style={{ width: '25%' }}>Travel Details</th>
              <th style={{ width: '35%' }}>Tags and Follow-Ups</th>
              <th style={{ width: '10%' }}>Team</th>
              <th style={{ width: '5%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map(trip => {
              const latestFollowUp = trip.follow_ups[0];
              const agentName = trip.assigned_agent_details?.first_name || 'Aalok';
              
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
                      {trip.tags.length > 0 && (
                        <div className="tags-row">
                          {trip.tags.map(tag => (
                            <span key={tag} className={`tag-badge ${tag.toLowerCase()}`}>
                              [{tag}]
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {latestFollowUp ? (
                        <>
                          <div className="followup-note" title={latestFollowUp.note}>
                            {latestFollowUp.note}
                          </div>
                          {renderFollowupDue(latestFollowUp.scheduled_date, agentName)}
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
                          ? `${trip.assigned_agent_details.first_name} ${trip.assigned_agent_details.last_name || ''}`.trim()
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
                            onClick={() => handleAssignTeam(trip.id)}
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
                      <span key={tag} className="tag-pill-interactive">
                        [{tag}]
                        <button 
                          className="tag-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTag(tag);
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
                            const matchedSuggestion = tagSuggestions.find(
                              s => s.toLowerCase() === tagInput.trim().toLowerCase()
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
                          key={tag}
                          className="tag-suggestion-item"
                          onClick={() => handleAddTag(tag)}
                        >
                          {tag}
                        </div>
                      ))}
                      {tagInput.trim() && !tagSuggestions.some(t => t.toLowerCase() === tagInput.trim().toLowerCase()) && (
                        <div 
                          className="tag-suggestion-item tag-suggestion-item create-new"
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
                  placeholder="Enter follow-up details (e.g. details of last conversation, tasks to do next)..."
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
    </div>
  );
}
