/**
 * Logs formatted text to console
 * @param tag - The logger tag
 * @param text - The logger text
 */
function log(tag, text) {
    const d = new Date(); // for now
    const h = d.getHours(); // => 9
    const m = d.getMinutes(); // =>  30
    const s = d.getSeconds(); // => 51

    console.log(`[\x1b[36m${h}:${m}:${s} | ${tag}\x1b[0m] ${text}`)

}

module.exports = log;