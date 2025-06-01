
import { SYSTEMS } from "./registry"

import { TreeOfLife } from "../tree-of-life"
import { SystemKey } from "./registry"

import { PartKey } from "./registry"

export class ModuleManager {
  private activeSystem: SystemKey | null = null
  private loadedParts  = new Set<PartKey>()
  private bridgedParts      = new Set<string>()

  constructor(private t: TreeOfLife) {}

  /**
   * Loads the base of a system (switching if necessary)
   * @param systemKey - the key of the system to load
   */
  loadSystem(systemKey: SystemKey) {
    if (this.activeSystem === systemKey) {
      return
    }

    if (this.activeSystem) {
      this.unloadSystem()
    }

    const loadedSystem = SYSTEMS.find(s => s.SYSTEM === systemKey)
    if (!loadedSystem) {
      throw new Error(`System ${systemKey} not found`)
    }

    loadedSystem.LOADERS.base(this.t)

    this.activeSystem = systemKey

    this.loadedParts.clear();
    this.loadedParts.add('base');
  }

  /**
   * Loads an optional part (colors, music, etc)
   * @param partKey - the key of the part to load
   */
  loadPart(partKey: PartKey) {
    if (!this.activeSystem) {
      throw new Error('load a system first');
    }

    const system = SYSTEMS.find(s => s.SYSTEM === this.activeSystem);
    if (!system) {
      throw new Error(`System ${this.activeSystem} not found`);
    }

    system.LOADERS[partKey](this.t);
    this.loadedParts.add(partKey);
  }

  /**
   * Unloads the active system and all its parts
   */
  unloadSystem() {
    if (!this.activeSystem) {
      return;
    }

    const system = SYSTEMS.find(s => s.SYSTEM === this.activeSystem);
    if (!system) {
      throw new Error(`System ${this.activeSystem} not found`);
    }

    // unload parts in reverse order so dependants go first
    const reversedParts = [...this.loadedParts].reverse();

    for (const part of reversedParts) {
      system.UNLOADERS[part](this.t);
    }

    this.activeSystem = null;
    this.loadedParts.clear();
    this.bridgedParts.clear();
  }

  /**
   * Runs a bridge (that connects two parts) if it is not already run and all its needs are loaded
   * @param bridgeKey - the key of the bridge to run
   */
  runBridge(bridgeKey: string) {
    const system = SYSTEMS.find(s => s.SYSTEM === this.activeSystem);
    if (!system) {
      throw new Error(`System ${this.activeSystem} not found`);
    }

    const bridge = system.BRIDGES.find(b => b.id === bridgeKey);
    if (!bridge) {
      throw new Error(`Bridge ${bridgeKey} not found`);
    }

    if (!this.bridgedParts.has(bridge.id) && bridge.needs.every(n => this.loadedParts.has(n))) 
    {
      bridge.run(this.t);
      this.bridgedParts.add(bridge.id);
    }
  }

  listAvailableParts() {
    return SYSTEMS.flatMap(s => Object.keys(s.LOADERS)).filter(p => p !== 'base');
  }

  listAvailableBridges() {
    return SYSTEMS.flatMap(s => s.BRIDGES);
  }

  listLoadedParts() {
    return [...this.loadedParts];
  }

  listBridgedParts() {
    return [...this.bridgedParts];
  }
}