import { EventsX, FountainX, ParticlesX, TreeX } from "immortal-core/Imports"
import { ArrayExtensions, Color, DOTA_GameState, EventsSDK, GameRules, Menu } from "wrapper/Imports"

const entries = Menu.AddEntry("Visual")
const menu = entries.AddNode("Tree rings")
const state = menu.AddToggle("State", true)
const mode2x = menu.AddToggle("Mode alpha", true)
const color = menu.AddColorPicker("Color squares", Color.Aqua)

let IsCreated = false
const Trees: TreeX[] = []
const pSDK = new ParticlesX()
const Fountains: FountainX[] = []

color.OnValue(OnUpdate)
state.OnValue(OnUpdate)
mode2x.OnValue(OnUpdate)

function OnUpdate() {

	const fountain = Fountains.find(x => !x.IsEnemy())

	if (fountain === undefined)
		return

	for (const tree of Trees) {

		if (!state.value || !tree.IsValid || !tree.IsAlive) {
			pSDK.DestroyByKey(tree.Handle)
			continue
		}

		pSDK.DrawBox(tree.Handle, fountain, {
			mode2X: mode2x.value,
			Position: tree.Position,
			Color: color.selected_color,
			Alpha: color.selected_color.a,
			Radius: tree.BaseEntity.RingRadius / 2,
		})
	}
}

EventsSDK.on("Tick", () => {
	if (!state.value || GameRules === undefined)
		return

	const treeActive = Trees.find(x => !x.IsAlive)
	if (treeActive !== undefined)
		OnUpdate()

	if (IsCreated)
		return

	if (GameRules.GameState >= DOTA_GameState.DOTA_GAMERULES_STATE_STRATEGY_TIME
		&& GameRules.GameState <= DOTA_GameState.DOTA_GAMERULES_STATE_GAME_IN_PROGRESS) {
		OnUpdate()
		IsCreated = true
	}
})

EventsX.on("EntityCreated", ent => {
	if (ent instanceof TreeX)
		Trees.push(ent)
	if (ent instanceof FountainX) {
		Fountains.push(ent)
		OnUpdate()
	}
})

EventsX.on("EntityDestroyed", ent => {

	if (ent instanceof TreeX) {
		pSDK.DestroyByKey(ent.Handle)
		ArrayExtensions.arrayRemove(Trees, ent)
	}

	if (ent instanceof FountainX)
		ArrayExtensions.arrayRemove(Fountains, ent)
})

EventsX.on("GameEnded", () => {
	IsCreated = false
})
