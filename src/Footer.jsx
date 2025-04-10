import React, { useState } from "react";
import "./Footer.css";

const Footer = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    mensaje: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el email
    alert("Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.");
    setFormData({
      nombre: "",
      email: "",
      mensaje: ""
    });
  };

  return (
    <footer className="footer">
      <div className="contact-section">
        <h2>Contacto</h2>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="mensaje">Mensaje</label>
            <textarea
              id="mensaje"
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submit-button">Enviar Mensaje</button>
        </form>
      </div>
    </footer>
  );
};

export default Footer; 