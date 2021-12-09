export function polarToCartesian(x: number, y: number, r: number, angleDeg: number) : [x: number, y: number] {
    const rad = (angleDeg-90) * Math.PI / 180.0;
      return [
        x + (r * Math.cos(rad)),
        y + (r * Math.sin(rad))
      ]; 
} 

export function describeArc(x=0, y=0, radius=1, startAngle=0, endAngle=360) :
string {

    const start = polarToCartesian(x, y, radius, endAngle - 0.01);
    const end = polarToCartesian(x, y, radius, startAngle);
    //const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    const arcSweep : '0'|'1' = endAngle - startAngle <= 180 ? '0' : '1';

    return `M ${start[0]} ${start[1]} A ${radius} ${radius} 0 ${arcSweep} 0 ${end[0]} ${end[1]} ${(endAngle - startAngle === 360) ? 'Z' : ''}`;     
}

export function getDistance(a : [number, number], b : [number, number]) {
  const A = a[0] - b[0]
  const B = a[1] - b[1]
  return Math.sqrt(A * A + B * B)
}