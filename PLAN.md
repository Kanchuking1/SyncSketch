# SyncSketch — Development Plan

## Overview

**SyncSketch** is a real-time collaborative whiteboard that allows multiple users to draw, edit, and interact on the same canvas simultaneously. The system focuses on low-latency synchronization between clients using persistent WebSocket connections and an object-based rendering model.

The primary goal of this project is to demonstrate the design of **interactive distributed systems**, including:

* Real-time state synchronization
* WebSocket-based communication
* Interactive graphics rendering
* Multi-user collaboration
* Scalable backend architecture

The final deliverable will be a **publicly deployed application** where multiple users can connect to a shared board and collaborate in real time.

---

# Project Goals

## Functional Goals

The application should support the following capabilities:

* Draw shapes on a shared canvas
* Real-time updates across multiple clients
* Object selection and movement
* Live cursor tracking for collaborators
* Persistent board state
* Publicly accessible deployment

## Technical Goals

The project aims to showcase the following engineering concepts:

* Low-latency distributed systems
* Event-driven synchronization protocols
* Efficient canvas rendering
* Client-server real-time communication
* Scalable WebSocket connection management

---

# System Architecture

## High-Level Architecture

Clients communicate with the backend through WebSockets. The backend server manages connections, broadcasts events, and maintains the current board state.

```
Browser Clients
       │
   WebSocket
       │
SyncSketch Server
       │
   Board State
```

## Components

### Frontend

Responsibilities:

* Render canvas elements
* Capture user interactions
* Send drawing events to the server
* Apply updates received from other users

Technologies:

* React
* HTML5 Canvas API
* WebSocket client
* Vite build system

---

### Backend

Responsibilities:

* Maintain WebSocket connections
* Broadcast events to connected clients
* Manage board state
* Synchronize new clients with existing board data

Technologies:

* Go (Golang)
* Gorilla WebSocket library
* Optional Redis state store

---

### Storage

Initial version:

* In-memory board state on server

Optional extension:

* Redis for persistence and scalability

---

# Data Model

## Shape Object

All drawable elements are stored as objects rather than pixel data.

Example shape:

```
{
  id: "shape_001",
  type: "line",
  points: [[120, 80], [200, 140]],
  color: "#000000",
  thickness: 2
}
```

## Cursor Object

Represents the current location of a user's cursor.

```
{
  userId: "user_01",
  x: 420,
  y: 180
}
```

---

# Communication Protocol

Clients communicate with the server using structured JSON messages.

### Add Shape

```
{
  "type": "ADD_SHAPE",
  "shape": { ... }
}
```

### Move Shape

```
{
  "type": "MOVE_SHAPE",
  "id": "shape_001",
  "x": 200,
  "y": 150
}
```

### Cursor Update

```
{
  "type": "CURSOR_UPDATE",
  "userId": "user_01",
  "x": 300,
  "y": 120
}
```

### Board Synchronization

```
{
  "type": "SYNC_BOARD",
  "shapes": [...]
}
```

---

# Technology Stack

## Frontend

* React
* HTML5 Canvas
* WebSocket client
* Vite

## Backend

* Go
* Gorilla WebSocket

## Infrastructure

* Fly.io or Render (backend hosting)
* Vercel (frontend hosting)
* Upstash Redis (optional)

---

# Development Timeline

The project will be completed over a **7-day development cycle**.

---

# Day 1 — Project Setup

Objectives:

* Initialize frontend and backend projects
* Implement basic canvas rendering
* Establish WebSocket connection

Tasks:

* Create React application using Vite
* Add canvas component
* Implement basic drawing functionality
* Initialize Go backend server
* Implement WebSocket endpoint

Deliverable:

A local whiteboard capable of drawing shapes with an active WebSocket connection.

---

# Day 2 — Shape-Based Rendering

Objectives:

Move from pixel drawing to object-based rendering.

Tasks:

* Define shape data structures
* Maintain shape state array
* Implement canvas render loop
* Refactor drawing to append shapes to state

Deliverable:

Canvas rendering driven entirely by shape objects.

---

# Day 3 — Real-Time Synchronization

Objectives:

Synchronize drawing events between clients.

Tasks:

* Implement WebSocket message handlers
* Broadcast shape creation events
* Update client state on received messages

Deliverable:

Multiple clients see drawings appear in real time.

---

# Day 4 — Shape Editing

Objectives:

Allow users to manipulate existing shapes.

Tasks:

* Implement hit detection
* Enable shape selection
* Implement dragging and repositioning
* Broadcast move events

Deliverable:

Shapes can be edited collaboratively by multiple users.

---

# Day 5 — Live Cursor Tracking

Objectives:

Display cursor positions of collaborators.

Tasks:

* Capture mouse movement
* Broadcast cursor updates
* Track remote cursor state
* Render collaborator cursors

Deliverable:

Users can see the live cursor position of other collaborators.

---

# Day 6 — Board Persistence

Objectives:

Persist board state across refreshes.

Tasks:

* Store shapes on server
* Send board state to new clients
* Implement board synchronization messages
* Optional Redis integration

Deliverable:

Board contents remain consistent after page reload.

---

# Day 7 — Deployment

Objectives:

Deploy full application stack.

Tasks:

* Deploy backend server to Fly.io or Render
* Configure production WebSocket endpoint
* Deploy frontend to Vercel
* Verify multi-user collaboration
* Publish demo link

Deliverable:

Publicly accessible SyncSketch deployment.

---

# Future Improvements

Potential enhancements after initial release:

### Performance Improvements

* Spatial indexing using quadtrees
* Efficient redraw batching
* Binary message encoding

### Collaboration Enhancements

* CRDT-based conflict resolution
* Operational transformation support
* Undo/redo system

### UI Features

* Multiple shape types
* Text annotations
* Infinite canvas with zoom
* User presence indicators

---

# Deliverables

The completed project will include:

* GitHub repository
* Public demo deployment
* Architecture documentation
* Technical design plan

---

# Success Criteria

The project is considered complete if:

* Multiple users can draw on the same canvas simultaneously
* Updates propagate in real time across clients
* Shapes can be edited collaboratively
* Live cursors are visible to all users
* The application is publicly accessible online
