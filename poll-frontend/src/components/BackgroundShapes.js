import React, { useState, useEffect } from 'react';

const NUM_SHAPES = 5;

function BackgroundShapes() {
    const [shapes, setShapes] = useState([]);

    useEffect(() => {
        const generateShapes = () => {
            return Array.from({ length: NUM_SHAPES }, (_, i) => ({
                id: i,
                size: Math.random() * 300 + 100,
                x: Math.random() * 100,
                y: Math.random() * 100,
                opacity: Math.random() * 0.15 + 0.05,
            }));
        };

        setShapes(generateShapes());

        const interval = setInterval(() => {
            setShapes(generateShapes());
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="background-shapes">
            {shapes.map(shape => (
                <div
                    key={shape.id}
                    className="background-shape"
                    style={{
                        width: shape.size + 'px',
                        height: shape.size + 'px',
                        left: shape.x + '%',
                        top: shape.y + '%',
                        opacity: shape.opacity,
                        background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
                    }}
                />
            ))}
            <style>{`
                .background-shapes {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    overflow: hidden;
                    z-index: 0;
                    pointer-events: none;
                    background: #18181B;
                }
                .background-shape {
                    position: absolute;
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    transition: all 3s ease;
                }
            `}</style>
        </div>
    );
}

export default BackgroundShapes; 