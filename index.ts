import "./Translate"

import { EventsX, FountainX, ParticlesX, TreeX } from "github.com/octarine-private/immortal-core/index"
import {
	ArrayExtensions,
	Color,
	DOTAGameState,
	EventsSDK,
	GameRules,
	Menu
} from "github.com/octarine-public/wrapper/index"

const entries = Menu.AddEntry("Visual")
const menu = entries.AddNode("TreeRings")
const state = menu.AddToggle("State")
const color = menu.AddColorPicker("Color squares", Color.Black.SetA(41))

let IsCreated = false
const Trees: TreeX[] = []
const pSDK = new ParticlesX()
const Fountains: FountainX[] = []

color.OnValue(OnUpdate)
state.OnValue(OnUpdate)

function OnUpdate() {
	const fountain = Fountains.find(x => !x.IsEnemy())
	if (fountain === undefined) {
		return
	}

	for (const tree of Trees) {
		if (!state.value || !tree.IsValid || !tree.IsAlive) {
			pSDK.DestroyByKey(tree.Handle)
			continue
		}

		pSDK.DrawBox(tree.Handle, fountain, {
			Position: tree.Position,
			Color: color.SelectedColor,
			Alpha: color.SelectedColor.a,
			Radius: tree.BaseEntity.RingRadius / 2
		})
	}
}

EventsSDK.on("Tick", () => {
	if (!state.value || GameRules === undefined) {
		return
	}

	const treeActive = Trees.find(x => !x.IsAlive)
	if (treeActive !== undefined) {
		OnUpdate()
	}

	if (IsCreated) {
		return
	}

	if (
		GameRules.GameState >= DOTAGameState.DOTA_GAMERULES_STATE_STRATEGY_TIME &&
		GameRules.GameState <= DOTAGameState.DOTA_GAMERULES_STATE_GAME_IN_PROGRESS
	) {
		OnUpdate()
		IsCreated = true
	}
})

EventsX.on("EntityCreated", ent => {
	if (ent instanceof TreeX) {
		Trees.push(ent)
	}
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

	if (ent instanceof FountainX) {
		ArrayExtensions.arrayRemove(Fountains, ent)
	}
})

EventsX.on("GameEnded", () => {
	IsCreated = false
})
