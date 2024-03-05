
let n = 3;
let stepTime = 2000;
let curMove = 0;

// 1. add svg
let m = { t: 90, b: 50, l: 240, r: 40 };
let w = 1300 - m.l - m.r;
let h = 480 - m.t - m.b;

let s = d3.select('body').append('svg')
    .attr('class', 'main')
    .attr('width', w + m.l + m.r)
    .attr('height', h + m.t + m.b)

// 2. add bars
let bw = 215,
    bh = h;
let bars;

addBars();

function addBars() {
    bars = [{
        x: 0 + bw / 2,
        y: h,
        lbl: 'Tower 1',
        id: 0,
        stacks: [],
    }, {
        x: w / 2,
        y: h,
        lbl: 'Tower 2',
        id: 1,
        stacks: [],
    }, {
        x: w - bw / 2,
        y: h,
        lbl: 'Tower 3',
        id: 2,
        stacks: [],
    }];

    s.selectAll(".bar")
        .data(bars)
        .enter().append('path')
        .attr('class', 'bar')
        .attr('transform', b => `translate(${m.l + b.x},${m.t + b.y})`)
        .attr('d', `m${-bw / 2},0 l${bw},0 m${-bw / 2},0 l0,${-bh}`)
        

    s.selectAll('.label')
        .data(bars)
        .enter().append('text')
        .attr('class', 'label')
        .attr('transform', b => `translate(${m.l + b.x},${m.t + b.y})`)
        .attr('dy', '1.2em')
        .text(b => b.lbl)
}

// 3. add disks
let disks;

addDisks();

function addDisks() {
    s.selectAll('.disk').remove();

    bars.forEach(b => b.stacks = [])
    disks = [];

    let dw_min = 90,
        dw_max = bw - 20,
        dw_scale = d3.scaleLinear().range([dw_min, dw_max]).domain([0, n - 1]),
        dws = [...Array(n).keys()].map(d => dw_scale(d)),
        dh = 45,
        rx = 25,
        discColors = ["purple", "lightblue", "orange","green","pink","red","yellow","darkblue"]; // Add more colors 

    for (let i = 0; i < n; i++) {
        dw = n == 1 ? dw_max : dws[i];
        disks.push({
            id: i,
            tagid: "r" + i,
            w: dw,
            h: dh,
            x: bars[0].x - dw / 2,
            y: bars[0].y - (n - i) * dh,
        });
    }

    s.selectAll('.disk')
        .data(disks)
        .enter().append('rect')
        .attr('id', d => d.tagid)
        .attr('class', 'disk')
        .attr('width', d => d.w)
        .attr('height', d => d.h)
        .attr('rx', rx)
        // .attr('fill', d => d3.schemeCategory10[d.id % 10])
        .attr('fill', (d, i) => discColors[i % discColors.length])
        .attr('transform', d => `translate(${m.l + d.x},${m.t + d.y})`)
}

// 4. move disks
let allTimeouts = [];

function moveDisks() {
    let schedule = [];
    function moveDisk(from, assist, to, n) {
        if (n == 1) {
            schedule.push([from, to]);
        } else {
            moveDisk(from, to, assist, n - 1);
            moveDisk(from, assist, to, 1);
            moveDisk(assist, from, to, n - 1);
        }
    }

    moveDisk(bars[0].id, bars[1].id, bars[2].id, n);

    bars[0].stacks.push(...disks.map(d => d3.select("#" + d.tagid)))

    function getPath(bf, bt, el) {
        let r = el.data()[0];

        let x1 = bf.x - r.w / 2;
        let y1 = -r.h;

        let x2 = bt.x - r.w / 2;
        let y2 = y1;

        let x3 = x2;
        let y3 = bt.y - (bt.stacks.length + 1) * r.h;

        return [x1, y1, x2, y2, x3, y3];
    }

    let transTime = stepTime / 3;

    for (let i = 0; i < schedule.length; i++) {
        let [from, to] = schedule[i],
            bf = bars[from],
            bt = bars[to],
            el = bf.stacks[0];

        let [x1, y1, x2, y2, x3, y3] = getPath(bf, bt, el);

        bt.stacks.unshift(bf.stacks.shift());

        let delayTime = stepTime * i;
        allTimeouts.push(
            setTimeout(() => {
                curMove++;
                d3.select('#moves').text(`${curMove}`);
                d3.select('#totalmoves').text(`${2 ** n - 1}`);

                el.transition().ease(d3.easeCubicOut)
                    .duration(transTime)
                    .attr('transform', `translate(${m.l + x1},${m.t + y1})`)

                    .transition()
                    .duration(transTime)
                    .attr('transform', `translate(${m.l + x2},${m.t + y2})`)

                    .transition()
                    .duration(transTime)
                    .attr('transform', `translate(${m.l + x3},${m.t + y3})`)
            }, delayTime)
        );
    }
}

// 5. ui
updateN(n);

function updateN(val) {
    n = val;
    d3.select('#n').property('value', n);
    // d3.select('#n4show').text(n);
    d3.select('#moves').text(`${curMove}`);
    d3.select('#totalmoves').text(`${2 ** n - 1}`);
    stop();
}

updateTime(stepTime)

function updateTime(val) {
    stepTime = val;
    d3.select('#tm').property('value', stepTime);
    d3.select('#tm4show').text(stepTime);
    stop();
}

function start() {
    stop();
    moveDisks();
}

function stop() {
    allTimeouts.forEach(d => clearTimeout(d));
    allTimeouts = [];
    curMove = 0;
    d3.select('#moves').text(`${curMove}`);
    d3.select('#totalmoves').text(`${2 ** n - 1}`);
    addDisks();
}
