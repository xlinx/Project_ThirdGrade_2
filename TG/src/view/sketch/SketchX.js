import fonts_TC from '/font/noto.otf';
import {drawY, preloadY, setupY} from "./script.js";

let noto = undefined;
export function SketchX(p5) {
    // p5.preload = async () => {
        // preloadY();
    // };
    p5.setup = async () => {
        noto = await p5.loadFont(fonts_TC)
        p5.createCanvas(600, 400, p5.P2D)
        p5.textFont(noto);
        // setupY(p5);
    };
    let propIN={}
    p5.updateWithProps = props => {
        console.log("[][SketchX][props]",props);
        propIN=props

    };
    p5.draw = () => {
        p5.background(22);
        // drawY(p5)
        // p5.rect(10,10,100,100);
        // p5.normalMaterial();
        p5.fill(128,0,0)
        p5.stroke(128,0,0)
        // p5.text(propIN?.obj_input?.count, 100, 100);
        p5.text(`北藝大${propIN.obj_input.count}`, 10, 10);
        p5.push();
        // p5.rotateZ(p5.frameCount * 0.01);
        p5.rotate(p5.frameCount * 0.1);
        // p5.rotateY(p5.frameCount * 0.01);
        p5.rect(0,0,100,100);
        p5.pop();
        propIN.obj_output({angle:p5.frameCount})
    };
}