{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.git-filter-repo
    pkgs.git-lfs
    pkgs.nodePackages.pnpm
    pkgs.nodePackages.typescript
  ];
}