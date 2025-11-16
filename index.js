const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/event', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: String,
  venue: String,
  image: String,
  prize: { type: Number, required: true, min: 0 }
});
eventSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v; // keep _id
    return ret;
  }
});


const Event = mongoose.model('Event', eventSchema);

app.post('/api/events', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      const searchNum = Number(search);
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
      if (!isNaN(searchNum)) {
        query.$or.push({ prize: searchNum });
      }
    }
    const events = await Event.find(query);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('Server workking'));










