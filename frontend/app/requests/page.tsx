'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  getTrips, 
  getTags, 
  createTag, 
  saveFollowUp, 
  assignAgent, 
  archiveTrip,
  convertLead
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

const PREDEFINED_DESTINATIONS = [
  'Maldives', 'Swiss Alps', 'Goa', 'London', 'Kashmir', 
  'Bali', 'Dubai', 'Singapore', 'Paris', 'New York'
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

  // Conversion Modal states
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [convertingTrip, setConvertingTrip] = useState<Trip | null>(null);
  
  // Conversion Form states
  const [refId, setRefId] = useState('');
  const [salesTeamId, setSalesTeamId] = useState(1);
  const [convertTags, setConvertTags] = useState<Tag[]>([]);
  const [convertTagInput, setConvertTagInput] = useState('');
  const [showConvertTagSuggestions, setShowConvertTagSuggestions] = useState(false);

  const [destinations, setDestinations] = useState<string[]>([]);
  const [destInput, setDestInput] = useState('');
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [nights, setNights] = useState(5);
  const [adults, setAdults] = useState(2);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [foc, setFoc] = useState(0);

  const [salutation, setSalutation] = useState('Mr.');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Click outside references
  const popoverRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const convertTagSuggestionsRef = useRef<HTMLDivElement | null>(null);
  const destSuggestionsRef = useRef<HTMLDivElement | null>(null);

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
      if (convertTagSuggestionsRef.current && !convertTagSuggestionsRef.current.contains(event.target as Node)) {
        setShowConvertTagSuggestions(false);
      }
      if (destSuggestionsRef.current && !destSuggestionsRef.current.contains(event.target as Node)) {
        setShowDestSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePopoverRow]);

  const handleOpenEditModal = (trip: Trip) => {
    setCurrentTrip(trip);
    setSelectedTags(trip.tags_details || []);
    
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

  // Open conversion modal
  const handleOpenConvertModal = (trip: Trip) => {
    setConvertingTrip(trip);
    setRefId(`REF-${trip.id}`);
    setSalesTeamId(trip.assigned_agent_details?.id || MOCK_AGENTS[0].id);
    setConvertTags(trip.tags_details || []);
    
    // Default destinations list
    if (trip.destination) {
      setDestinations([trip.destination]);
    } else {
      setDestinations([]);
    }

    setStartDate(trip.start_date || '');
    setNights(5);
    setAdults(2);
    setChildAges([]);
    setFoc(0);
    
    setSalutation('Mr.');
    setGuestName(trip.primary_contact_name);
    setGuestPhone(trip.phone);
    setNotes('');

    setConvertModalOpen(true);
  };

  const handleSaveConversion = () => {
    if (!convertingTrip) return;

    const tagIds = convertTags.map(t => t.id);
    const destString = destinations.join(', ');
    const childrenAgesString = childAges.join(', ');

    const payload = {
      query_source: 'WhatsApp', // Default/read-only source
      reference_id: refId,
      sales_team_id: salesTeamId,
      tags: tagIds,
      destinations: destString,
      start_date: startDate ? new Date(startDate).toISOString().slice(0, 10) : null,
      nights: Number(nights),
      adults: Number(adults),
      children_ages: childrenAgesString,
      foc: Number(foc),
      salutation,
      guest_name: guestName,
      guest_phone: guestPhone,
      notes
    };

    convertLead(convertingTrip.id, payload)
      .then(() => {
        // Converted successfully, filter it out from requests view
        setTrips(trips.filter(t => t.id !== convertingTrip.id));
        setConvertModalOpen(false);
        alert('Query successfully created and lead converted to Trip pipeline!');
      })
      .catch((err) => {
        console.error('Failed to convert lead:', err);
        alert('Error converting lead: ' + (err.response?.data?.detail || err.message));
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

  // Autocomplete tags suggestions
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

  // Autocomplete suggestions for Conversion tags
  const filteredConvertTagSuggestions = tagsList.filter(
    tag => tag.name.toLowerCase().includes(convertTagInput.toLowerCase()) && 
    !convertTags.some(t => t.id === tag.id)
  );

  const handleAddConvertTag = (tag: Tag) => {
    if (!convertTags.some(t => t.id === tag.id)) {
      setConvertTags([...convertTags, tag]);
    }
    setConvertTagInput('');
    setShowConvertTagSuggestions(false);
  };

  const handleRemoveConvertTag = (tagId: number) => {
    setConvertTags(convertTags.filter(t => t.id !== tagId));
  };

  const handleCreateConvertCustomTag = () => {
    const cleanTagName = convertTagInput.trim().toUpperCase();
    if (!cleanTagName) return;

    const matched = tagsList.find(t => t.name.toUpperCase() === cleanTagName);
    if (matched) {
      handleAddConvertTag(matched);
      return;
    }

    createTag({ name: cleanTagName, color: '#f3f4f6' })
      .then((res) => {
        const newTagObj = res.data;
        setTagsList([...tagsList, newTagObj]);
        setConvertTags([...convertTags, newTagObj]);
        setConvertTagInput('');
        setShowConvertTagSuggestions(false);
      })
      .catch((err) => {
        console.error('Failed to create convert tag:', err);
      });
  };

  // Autocomplete suggestions for Destinations
  const filteredDestSuggestions = PREDEFINED_DESTINATIONS.filter(
    dest => dest.toLowerCase().includes(destInput.toLowerCase()) && !destinations.includes(dest)
  );

  const handleAddDestination = (dest: string) => {
    if (dest && !destinations.includes(dest)) {
      setDestinations([...destinations, dest]);
    }
    setDestInput('');
    setShowDestSuggestions(false);
  };

  const handleRemoveDestination = (dest: string) => {
    setDestinations(destinations.filter(d => d !== dest));
  };

  const handleCreateCustomDestination = () => {
    const cleanDest = destInput.trim();
    if (cleanDest && !destinations.includes(cleanDest)) {
      setDestinations([...destinations, cleanDest]);
    }
    setDestInput('');
    setShowDestSuggestions(false);
  };

  // Dynamic children ages handler
  const handleAddChildAge = () => {
    setChildAges([...childAges, 5]); // Default age of 5
  };

  const handleUpdateChildAge = (index: number, age: number) => {
    const updated = [...childAges];
    updated[index] = age;
    setChildAges(updated);
  };

  const handleRemoveChildAge = (index: number) => {
    setChildAges(childAges.filter((_, i) => i !== index));
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

                    {/* Actions Column */}
                    <td className="action-cell">
                      <div 
                        ref={el => { popoverRefs.current[trip.id] = el; }}
                        style={{ display: 'inline-flex', alignItems: 'center' }}
                      >
                        {/* Convert to Query Trigger (+) */}
                        <button 
                          className="btn-convert-trigger"
                          onClick={() => handleOpenConvertModal(trip)}
                          title="Create New Query"
                        >
                          +
                        </button>

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

      {/* Create New Query from Request (Lead Conversion) Modal */}
      {convertModalOpen && convertingTrip && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>Create New Query from Request</h3>
              <button className="modal-close" onClick={() => setConvertModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              <div className="form-grid-2">
                
                {/* SECTION 1: Query Source */}
                <div className="form-section-title">1. Query Source</div>
                
                <div className="form-group">
                  <label className="form-label">Query Source</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value="WhatsApp" 
                    readOnly 
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Reference ID</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={refId}
                    onChange={(e) => setRefId(e.target.value)}
                    placeholder="Enter Reference ID"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sales Team</label>
                  <select 
                    className="form-input"
                    value={salesTeamId}
                    onChange={(e) => setSalesTeamId(Number(e.target.value))}
                  >
                    {MOCK_AGENTS.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.first_name} {agent.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <div className="tag-autocomplete" ref={convertTagSuggestionsRef}>
                    <div className="tag-select-box" onClick={() => setShowConvertTagSuggestions(true)}>
                      {convertTags.map(tag => (
                        <span key={tag.id} className="tag-pill-interactive" style={{ color: tag.color, borderColor: tag.color }}>
                          [{tag.name}]
                          <button 
                            className="tag-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveConvertTag(tag.id);
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input 
                        type="text"
                        className="tag-select-input"
                        placeholder={convertTags.length === 0 ? "Select or create tags..." : ""}
                        value={convertTagInput}
                        onChange={(e) => {
                          setConvertTagInput(e.target.value);
                          setShowConvertTagSuggestions(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (convertTagInput.trim()) {
                              const matched = tagsList.find(
                                s => s.name.toLowerCase() === convertTagInput.trim().toLowerCase()
                              );
                              if (matched) {
                                handleAddConvertTag(matched);
                              } else {
                                handleCreateConvertCustomTag();
                              }
                            }
                          }
                        }}
                      />
                    </div>

                    {showConvertTagSuggestions && (convertTagInput || filteredConvertTagSuggestions.length > 0) && (
                      <div className="tag-suggestions">
                        {filteredConvertTagSuggestions.map(tag => (
                          <div 
                            key={tag.id}
                            className="tag-suggestion-item"
                            onClick={() => handleAddConvertTag(tag)}
                          >
                            {tag.name}
                          </div>
                        ))}
                        {convertTagInput.trim() && !tagsList.some(t => t.name.toLowerCase() === convertTagInput.trim().toLowerCase()) && (
                          <div 
                            className="tag-suggestion-item create-new"
                            onClick={handleCreateConvertCustomTag}
                          >
                            Create Tag &quot;{convertTagInput.trim().toUpperCase()}&quot;
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 2: Destination and Duration */}
                <div className="form-section-title">2. Destination &amp; Duration</div>
                
                <div className="form-group span-2">
                  <label className="form-label">Destinations (Creatable Select)</label>
                  <div className="dest-autocomplete" ref={destSuggestionsRef}>
                    <div className="dest-select-box" onClick={() => setShowDestSuggestions(true)}>
                      {destinations.map(dest => (
                        <span key={dest} className="dest-pill">
                          {dest}
                          <button 
                            className="dest-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveDestination(dest);
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input 
                        type="text"
                        className="dest-select-input"
                        placeholder={destinations.length === 0 ? "Search or type to add destinations..." : ""}
                        value={destInput}
                        onChange={(e) => {
                          setDestInput(e.target.value);
                          setShowDestSuggestions(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (destInput.trim()) {
                              const matched = PREDEFINED_DESTINATIONS.find(
                                d => d.toLowerCase() === destInput.trim().toLowerCase()
                              );
                              if (matched) {
                                handleAddDestination(matched);
                              } else {
                                handleCreateCustomDestination();
                              }
                            }
                          }
                        }}
                      />
                    </div>

                    {showDestSuggestions && (destInput || filteredDestSuggestions.length > 0) && (
                      <div className="dest-suggestions">
                        {filteredDestSuggestions.map(dest => (
                          <div 
                            key={dest}
                            className="dest-suggestion-item"
                            onClick={() => handleAddDestination(dest)}
                          >
                            {dest}
                          </div>
                        ))}
                        {destInput.trim() && !PREDEFINED_DESTINATIONS.some(d => d.toLowerCase() === destInput.trim().toLowerCase()) && (
                          <div 
                            className="dest-suggestion-item create-new"
                            onClick={handleCreateCustomDestination}
                          >
                            Add Destination &quot;{destInput.trim()}&quot;
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input 
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">No. of Nights</label>
                  <input 
                    type="number"
                    className="form-input"
                    min={1}
                    value={nights}
                    onChange={(e) => setNights(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">No. of Adults</label>
                  <input 
                    type="number"
                    className="form-input"
                    min={1}
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total FOC</label>
                  <input 
                    type="number"
                    className="form-input"
                    min={0}
                    value={foc}
                    onChange={(e) => setFoc(Number(e.target.value))}
                  />
                </div>

                <div className="form-group span-2">
                  <label className="form-label">Children and Ages</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {childAges.map((age, index) => (
                      <div key={index} className="child-age-row">
                        <span style={{ fontSize: '13px' }}>Child #{index + 1} Age:</span>
                        <input 
                          type="number" 
                          className="form-input child-age-input" 
                          min={0} 
                          max={17}
                          value={age} 
                          onChange={(e) => handleUpdateChildAge(index, Number(e.target.value))}
                        />
                        <button 
                          className="btn-remove-child"
                          onClick={() => handleRemoveChildAge(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <div>
                      <button 
                        className="btn-add-child"
                        onClick={handleAddChildAge}
                      >
                        + Add Child
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Guest Details */}
                <div className="form-section-title">3. Guest Details</div>
                
                <div className="form-group">
                  <label className="form-label">Salutation</label>
                  <select 
                    className="form-input"
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value)}
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Guest Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter Guest Full Name"
                  />
                </div>

                <div className="form-group span-2">
                  <label className="form-label">Phone Number(s)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="Enter phone contact(s) (e.g. +91 99999 88888)"
                  />
                </div>

                {/* SECTION 4: Comments or Notes */}
                <div className="form-section-title">4. Comments or Notes</div>

                <div className="form-group span-2">
                  <label className="form-label">Comments</label>
                  <textarea 
                    className="form-input" 
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide additional details or special requests..."
                  />
                </div>

              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setConvertModalOpen(false)}>Cancel</button>
              <button 
                className="btn-save" 
                onClick={handleSaveConversion}
                disabled={!guestName.trim() || !guestPhone.trim() || destinations.length === 0}
                style={{ opacity: (!guestName.trim() || !guestPhone.trim() || destinations.length === 0) ? 0.6 : 1 }}
              >
                Save Details &amp; Convert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
