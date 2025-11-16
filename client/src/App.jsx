import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Card,
  Button,
  Modal,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { Sparkles, Calendar, MapPin, Plus, Edit2, Trash2 } from "lucide-react";

export default function EventVibes() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    image: "",
    prize: "",
  });

  const apiUrl = "http://localhost:5000/api/events";

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(apiUrl);
      setEvents(res.data);
    } catch (err) {
      console.error("Could not fetch events:", err);
    }
  };

  const handleShow = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: event.date || "",
        venue: event.venue || "",
        image: event.image || "",
        prize: event.prize || "",
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: "",
        description: "",
        date: "",
        venue: "",
        image: "",
        prize: "",
      });
    }
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData, prize: Number(formData.prize) };
      if (editingEvent) {
        await axios.put(`${apiUrl}/${editingEvent._id}`, dataToSend);
      } else {
        await axios.post(apiUrl, dataToSend);
      }
      fetchEvents();
      handleClose();
    } catch (err) {
      console.error("Error saving event:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      console.log("Attempting to delete event with ID:", id);
      const response = await axios.delete(`${apiUrl}/${id}`);
      console.log("Delete response:", response);
      if (response.status === 200) {
        console.log("Event deleted successfully");
        fetchEvents();
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (err) {
      console.error("Error deleting event:", err.response ? err.response.data : err.message);
      alert("Failed to delete event. Please try again.");
    }
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    try {
      const res = await axios.get(`${apiUrl}?search=${term}`);
      setEvents(res.data);
    } catch (err) {
      console.error("Error searching events:", err);
    }
  };

  return (
    <section
      className="py-5"
      style={{ background: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)" }}
    >
      <Container className="text-center mb-4">
        <h1 className="display-4">
          Welcome to <span style={{ color: "#6f42c1" }}>Event Vibes ✨</span>
        </h1>
        <p className="lead">
          Keep track of your events, add your vibe, and stay on top of your schedule.
          <span style={{ color: "#e83e8c" }}> Let's make it memorable!</span>
        </p>
        <Button
          variant="primary"
          className="mt-3 d-inline-flex align-items-center"
          onClick={() => handleShow()}
        >
          <Plus size={18} className="me-2" /> Add New Event
        </Button>
      </Container>
      <Container className="mb-4">
        <Form.Control
          type="text"
          placeholder="Search events by title , venue and price..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </Container>

      <Container>
        {events.length === 0 ? (
          <p className="text-center">No events yet. Add your first vibe ✨</p>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {events.map((event) => (
              <Col key={event._id}>
                <Card className="shadow-sm h-100">
                  {event.image ? (
                    <Card.Img
                      variant="top"
                      src={event.image}
                      style={{ height: "180px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        height: "180px",
                        backgroundColor: "#e9ecef",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Sparkles size={40} color="#6f42c1" />
                    </div>
                  )}
                  <Card.Body>
                    <Card.Title>{event.title}</Card.Title>
                    <Card.Text style={{ fontSize: "0.9rem" }}>
                      {event.description || "No description, but it's gonna be lit 🔥"}
                    </Card.Text>
                    <Card.Text style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                      Prize: ${event.prize || 0}
                    </Card.Text>
                    <Card.Text style={{ fontStyle: "italic", fontSize: "0.8rem" }}>
                      {event.date && (
                        <>
                          <Calendar size={14} className="me-1" />
                          {event.date} |{" "}
                        </>
                      )}
                      {event.venue && (
                        <>
                          <MapPin size={14} className="me-1" />
                          {event.venue}
                        </>
                      )}
                    </Card.Text>
                    <div className="d-flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="warning"
                        className="d-flex align-items-center gap-1 flex-1"
                        onClick={() => handleShow(event)}
                      >
                        <Edit2 size={14} /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        className="d-flex align-items-center gap-1 flex-1"
                        onClick={() => handleDelete(event._id)}
                      >
                        <Trash2 size={14} /> Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingEvent ? "Edit Your Event" : "Add a New Event"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Prize ($)</Form.Label>
              <Form.Control
                type="number"
                name="prize"
                value={formData.prize || ""}
                onChange={handleChange}
                min="0"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Venue</Form.Label>
              <Form.Control
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              {editingEvent ? "Update Event" : "Add Event"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </section>
  );
}



