# 100% MADE BY AI
# INSTALUJ ARCH

Prohlížečová hra: nainstaluj Arch Linux do notebooku a na konci spusť window manager.

Postup drží [Installation guide](https://wiki.archlinux.org/title/Installation_guide) (stav wiki k září 2026, ISO 2026.09.01, jádro 7.2.2). Notebook je UEFI, Intel i5-1240P, grafika Intel Iris Xe, disk `/dev/nvme0n1`, klávesnice CZ QWERTZ.

## Spuštění

Otevři `index.html` v prohlížeči, nebo:

```bash
python3 -m http.server 8080
```

Pak jdi na [http://localhost:8080](http://localhost:8080).

## Jak se hraje

1. Ve firmwaru vypni Secure Boot. Instalační obraz ho neumí. Flashka s ISO už je v portu.
2. V terminálu live ISO (`root@archiso`, zsh) piš opravdové příkazy: `loadkeys`, `iwctl`, `fdisk`, `mkfs`, `mount`, `pacstrap -K`, `genfstab`, `arch-chroot -S`, `bootctl` nebo GRUB.
3. Po restartu flashku vytáhni, založ uživatele a nainstaluj jeden window manager.

Na výběr jsou i3, Sway, Hyprland, awesome, Openbox, bspwm a dwm. Příkaz `hint` ukáže postup z wiki a ubere skóre čistoty. Heslo k Wi-Fi `arch-home` je na nálepce routeru.

Rozdělaná instalace se ukládá do `localStorage`.

## Ovládání

| Klávesa | Akce |
| --- | --- |
| Enter | odeslat příkaz |
| Tab | doplnit příkaz |
| ↑ / ↓ | historie |
| Ctrl+L | vyčistit terminál |
| `hint` | nápověda k aktuálnímu kroku |
