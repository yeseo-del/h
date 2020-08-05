"use strict";

function rebirth(warning = true) {
	// Wooow
	const gain = calcRP();
	if (
		game.inTrial !== 0 ||
		document.getElementById(17).classList.contains("btn-locked")
	)
		return;
	if (gain.lt(1) && warning)
		if (
			!confirm(
				"Are you sure you want to rebirth? You will get no reward."
			)
		)
			return;
	game.rp.amount = game.rp.amount.add(gain);
	game.rp.total = game.rp.total.add(gain);
	game.x.amount = new D(0);
	game.y.amount = new D(0);
	game.z.amount = new D(0);
	game.upgrades = [];
	game.rebirthed = true;
}

function calcRP(floor = 1) {
	const y = game.y.amount;

	if (y.lt(1e3)) return new D(0);
	return floor === 1 ? D.max(rawCalcRP().floor(), 0) : rawCalcRP();
}

function rawCalcRP() {
	const x = game.x.amount;
	const y = game.y.amount;
	const z = game.z.amount;
	const r = game.rupgrades;
	const a = game.aupgrades;

	return new D(y.div(100).log10())
		.add(r[41] >= 1 ? Math.log10(x.add(1).log10() + 1) : 0)
		.add(r[41] >= 2 ? Math.log(z.add(1).log10() + 1) : 0)
		.add(r[41] >= 3 ? y.add(1).log10() ** 0.5 : 0)
		.mul(r[33] >= 1 ? 1.25 : 1)
		.mul(r[33] >= 2 ? 1.1 : 1)
		.mul(a.includes(3) ? 1.025 : 1)
		.mul(rupg35Boost[r[35] || 0] ** Math.floor(game.z.amount.add(1).log10()), 1.4)
		.sub(game.rp.total.div(1.5));
}

const rupg35Boost = [1, 1.001, 1.004, 1.007, 1.01];

// Documentation somewhere around game.js:101
function buyreb(id) {
	const ele = $(`#r${id}`);
	let tier = game.rupgrades[id] || 0;
	const cost = new D(rebirthUpgradeInfo[id][1][tier]);
	if (game.rupgrades[id] >= rebirthUpgradeInfo[id][1].length) return;
	if (cost.gt(game.rp.amount)) return;
	if (ele.classList.contains("btn-rebirth-locked")) return;
	game.rp.amount = game.rp.amount.sub(cost);
	tier++;
	game.rupgrades[id] = tier;
	if (game.rupgrades[id] === rebirthUpgradeInfo[id][1].length) {
		ele.classList.remove("btn-rebirth-unbought");
		ele.classList.add("btn-rebirth-bought");
	}
	if (rebirthChildList[id] && tier === 1 && id !== 63) {
		rebirthChildList[id].forEach(id2 => {
			const ele2 = $(`#r${id2}`);
			if (!ele2 || id2 === 14) return;
			ele2.classList.remove("btn-rebirth-locked");
			ele2.classList.add("btn-rebirth-unbought");
		});
	}
	recalcProd();
}

function respecRebirthTree() {
	// Let amount = 0;
	// for (const key in game.rupgrades) {
	// for (let i = game.rupgrades[key]; i !== 0; i--)
	// amount += rebirthUpgradeInfo[key][1][i - 1];
	// }
	if (
		!confirm(
			"Are you sure you want to respec your" +
				" rebirth tree? You will reset the current rebirth."
		)
	)
		return;
	game.rupgrades = game.rupgrades[14] >= 1 ? { 14: 1 } : {};
	game.rp.amount = game.rp.total;
	rebirth(false);
}
