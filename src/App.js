import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

const App = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
  });

  const apiUrl = "http://localhost:5000/events"; // API URL

  // Fetch events
  const fetchEvents = async () => {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const formattedEvents = data.map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Add a new event
  const addEvent = async (newEvent) => {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });
      const createdEvent = await response.json();
      setEvents((prevEvents) => [
        ...prevEvents,
        { ...createdEvent, start: new Date(createdEvent.start), end: new Date(createdEvent.end) },
      ]);
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  // Handle drag-and-drop event
  const onEventDrop = ({ event, start, end, allDay }) => {
    const updatedEvent = { ...event, start, end, allDay };
    updateEvent(updatedEvent);
  };

  // Handle delete event on selection
  const onSelectEvent = (event) => {
    const confirmDelete = window.confirm(`Do you want to delete this event?`);
    if (confirmDelete) deleteEvent(event.id);
  };

  // Handle modal input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  // Update an event
  const updateEvent = async (updatedEvent) => {
    try {
      await fetch(`${apiUrl}/${updatedEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      });
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  // Delete an event
  const deleteEvent = async (eventId) => {
    try {
      await fetch(`${apiUrl}/${eventId}`, { method: "DELETE" });
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  // Create new event
  const handleSubmitNewEvent = () => {
    if (newEvent.title && newEvent.start && newEvent.end) {
      addEvent({
        ...newEvent,
        start: new Date(newEvent.start),
        end: new Date(newEvent.end),
      });
      setNewEvent({ title: "", start: "", end: "" });
      setShowModal(false);
    } else {
      alert("Please fill out all fields!");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="container-fluid" style={{ height: "100vh" }}>
      <div className="row h-100">
        <div className="col-lg-9 col-md-8 col-sm-12">
          <h1 className="d-flex justify-content-between align-items-center">
            Calendar
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              Create Event
            </button>
          </h1>
          <DragAndDropCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "85vh" }}
            defaultView="month"
            onEventDrop={onEventDrop}
            onSelectEvent={onSelectEvent}
          />
        </div>
        <div className="col-lg-3 col-md-4 col-sm-12 bg-light border-start">
          <h2 className="text-center mt-3">Upcoming Events</h2>
          <ul className="list-group mt-4">
            {events.filter(event => moment(event.start).isSame(new Date(), 'day')).length > 0 ? (
              events
                .filter((event) => moment(event.start).isSame(new Date(), "day"))
                .map((event) => (
                  <li key={event.id} className="list-group-item">
                    <strong>{event.title}</strong>
                    <br />
                    <span>
                      {moment(event.start).format("h:mm A")} -{" "}
                      {moment(event.end).format("h:mm A")}
                    </span>
                  </li>
                ))
            ) : (
              <li className="list-group-item text-center text-muted">
                No events today!
              </li>
            )}
          </ul>
        </div>
      </div>
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Event</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={newEvent.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Start Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    name="start"
                    value={newEvent.start}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>End Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    name="end"
                    value={newEvent.end}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmitNewEvent}
                >
                  Save Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
