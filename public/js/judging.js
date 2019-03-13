let viewerIframe = document.getElementById("entry-viewer-iframe");
let spinner = document.getElementById("loading-spinner");

let Slider = function({
    title,
    name,
    description,
    id,
    max,
    color,
    borderColor,
    leftLabel,
    rightLabel
}) {
    this.title = title;
    this.name = name;
    this.description = description;
    this.id = id;
    this.max = max;
    this.min = 0;
    this.value = max / 2;
    this.color = color;
    this.border = borderColor;
    this.leftLabel = leftLabel;
    this.rightLabel = rightLabel;
};
Slider.prototype.create = function() {
    let container = document.getElementById(this.id);
    let title = document.createElement("h3");
    title.textContent = this.title;
    let description = document.createElement("p");
    description.textContent = this.description;
    let leftLabel = document.createElement("span");
    leftLabel.style.float = "left";
    leftLabel.className = "label";
    let rightLabel = document.createElement("span");
    rightLabel.style.float = "right";
    rightLabel.className = "label";
    let leftLabelTxt = document.createTextNode(this.leftLabel);
    let rightLabelTxt = document.createTextNode(this.rightLabel);
    leftLabel.appendChild(leftLabelTxt);
    rightLabel.appendChild(rightLabelTxt);
    let slider = document.createElement("input");
    slider.className = "slider";
    slider.name = this.name;
    slider.type = "range";
    slider.min = this.min;
    slider.max = this.max;
    slider.value = this.value;
    slider.style.background = this.color;
    slider.style.border = "1px solid " + this.border;
    let currentValue = document.createElement("div");
    currentValue.className = "current-value";
    currentValue.style.left = slider.value * 10 + "%";
    currentValue.textContent = slider.value / 2;
    slider.oninput = function() {
        currentValue.style.left = slider.value * 10 + "%";
        currentValue.textContent = slider.value / 2;
    }
    let ticks = document.createElement("div");
    ticks.className = "sliderTicks";
    for (let i = this.min; i < this.max / 2 + 1; ++i) {
        let tickVal = document.createElement("div");
        tickVal.className = "tick tickBottom";
        tickVal.style.left = (i * this.max * 2) + "%";
        let vals = document.createTextNode(i);
        tickVal.appendChild(vals);
        ticks.appendChild(tickVal);
    }
    container.appendChild(title);
    container.appendChild(description)
    container.appendChild(leftLabel);
    container.appendChild(rightLabel);
    container.appendChild(currentValue);
    container.appendChild(slider);
    container.appendChild(ticks);
};

let creativitySlider = new Slider({
    title: "CREATIVITY",
    name: "creativity",
    description: "Does this program put an unexpected spin on the ordinary? Do they use shapes or ideas in cool ways?",
    id: "creativity-slider",
    max: 10,
    color: "#b9e986",
    borderColor: "#7ed320",
    leftLabel: "Unimaginative",
    rightLabel: "Inventive"
});
creativitySlider.create();
let complexitySlider = new Slider({
    title: "COMPLEXITY",
    name: "complexity",
    description: "Does this program appear to have taken lots of work? Is the code complex or output intricate?",
    id: "complexity-slider",
    max: 10,
    color: "#c6aef8",
    borderColor: "#8e5bf4",
    leftLabel: "Basic",
    rightLabel: "Elaborate"
});
complexitySlider.create();
let qualityCodeSlider = new Slider({
    title: "QUALITY CODE",
    name: "quality_code",
    description: "Does this program have cleanly indented, commented code? Are there any syntax errors or program logic errors?",
    id: "quality-code-slider",
    max: 10,
    color: "#ffc86e",
    borderColor: "#fea839",
    leftLabel: "Poor",
    rightLabel: "Elegant"
});
qualityCodeSlider.create();
let interpretationSlider = new Slider({
    title: "INTERPRETATION",
    name: "interpretation",
    description: "Does this program portray the overall theme of the contest?",
    id: "interpretation-slider",
    max: 10,
    color: "#ed8995",
    borderColor: "#d0011b",
    leftLabel: "Unrelated",
    rightLabel: "Representative"
});
interpretationSlider.create();

viewerIframe.addEventListener("load", () => {
    viewerIframe.style.display = "block";
    spinner.style.display = "none";
});