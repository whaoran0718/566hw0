import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Cube extends Drawable {
    indices: Uint32Array;
    positions: Float32Array;
    normals: Float32Array;
    center: vec4;
    cojoint: boolean;

    constructor(center: vec3, cojoint: boolean = false) {
        super();
        this.center = vec4.fromValues(center[0], center[1], center[2], 1);
        this.cojoint = cojoint;
    }

    create() {
        if (!this.cojoint) {
            // Cube with separated faces
            this.createSeparateCube();
        }
        else {
            // Cube with conjoint faces
            this.createCojointCube();
        }                          

        this.generateIdx();
        this.generatePos();
        this.generateNor();

        this.count = this.indices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

        console.log("Created Cube");
    }

    private createSeparateCube() {
        this.indices = new Uint32Array([0, 1, 2, 0, 2, 3,
                                        4, 5, 6, 4, 6, 7,
                                        8, 9, 10, 8, 10, 11,
                                        12, 13, 14, 12, 14, 15,
                                        16, 17, 18, 16, 18, 19,
                                        20, 21, 22, 20, 22, 23]);
        this.positions = new Float32Array([-1, 1, 1, 1,
                                            -1, -1, 1, 1,
                                            1, -1, 1, 1,
                                            1, 1, 1, 1,     // front

                                            -1, -1, -1, 1,
                                            -1, 1, -1, 1,
                                            1, 1, -1, 1,
                                            1, -1, -1, 1,    // back

                                            1, -1, 1, 1,
                                            1, -1, -1, 1,
                                            1, 1, -1, 1,
                                            1, 1, 1, 1,     // right

                                            -1, -1, -1, 1,
                                            -1, -1, 1, 1,
                                            -1, 1, 1, 1,
                                            -1, 1, -1, 1,   // left

                                            1, 1, -1, 1,
                                            -1, 1, -1, 1,
                                            -1, 1, 1, 1,
                                            1, 1, 1, 1,     // top

                                            -1, -1, -1, 1,
                                            1, -1, -1, 1,
                                            1, -1, 1, 1,
                                            -1, -1, 1, 1     // bottom
                                            ]);
        this.normals = new Float32Array([0, 0, 1, 0,
                                        0, 0, 1, 0,
                                        0, 0, 1, 0,
                                        0, 0, 1, 0,     // front
                            
                                        0, 0, -1, 0,
                                        0, 0, -1, 0,
                                        0, 0, -1, 0,
                                        0, 0, -1, 0,    // back
                            
                                        1, 0, 0, 0,
                                        1, 0, 0, 0,
                                        1, 0, 0, 0,
                                        1, 0, 0, 0,     // right
                            
                                        -1, 0, 0, 0,
                                        -1, 0, 0, 0,
                                        -1, 0, 0, 0,
                                        -1, 0, 0, 0,    // left
                            
                                        0, 1, 0, 0,
                                        0, 1, 0, 0,
                                        0, 1, 0, 0,
                                        0, 1, 0, 0,     // top
                            
                                        0, -1, 0, 0,
                                        0, -1, 0, 0,
                                        0, -1, 0, 0,
                                        0, -1, 0, 0,    // bottom
                                        ]);
        for (let i = 0; i < 24; i++) {
            this.positions[i * 4] += this.center[0];
            this.positions[i * 4 + 1] += this.center[1];
            this.positions[i * 4 + 2] += this.center[2];
        }
    }

    private createCojointCube() {   
        this.indices = new Uint32Array([0, 1, 2, 0, 2, 3,
                                        1, 4, 5, 1, 5, 2,
                                        4, 6, 7, 4, 7, 5,
                                        6, 0, 3, 6, 3, 7,
                                        3, 2, 5, 3, 5, 7,
                                        0, 6, 4, 0, 4, 1]);
        this.positions = new Float32Array([-1, -1, 1, 1,
                                            1, -1, 1, 1,
                                            1, 1, 1, 1,
                                            -1, 1, 1, 1,
                                            1, -1, -1, 1,
                                            1, 1, -1, 1,
                                            -1, -1, -1, 1,
                                            -1, 1, -1, 1]);
        this.normals = new Float32Array(this.positions.length);
        function normalize(vec : vec4) {
            let len = Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2) + Math.pow(vec[2], 2) + Math.pow(vec[3], 2));
            return vec4.fromValues(vec[0] / len, vec[1] / len, vec[2] / len, vec[3] / len);
        }

        for (let i = 0; i < 8; i++) {
            let norm = vec4.fromValues(this.positions[i * 4], 
                        this.positions[i * 4 + 1],
                        this.positions[i * 4 + 2],
                        0);
            norm = normalize(norm);
            this.normals.set(norm, i * 4);
        }
        for (let i = 0; i < 8; i++) {
            this.positions[i * 4] += this.center[0];
            this.positions[i * 4 + 1] += this.center[1];
            this.positions[i * 4 + 2] += this.center[2];
        }
    }
};

export default Cube;