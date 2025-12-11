import { useState } from "react";
import { Plus, Trash2, GripVertical, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StagedAsset, AssetGroup } from "./types";
import { v4 as uuidv4 } from "uuid";

interface Step3GroupProps {
  stagedAssets: StagedAsset[];
  groups: AssetGroup[];
  onUpdateGroups: (groups: AssetGroup[]) => void;
}

export function Step3Group({ stagedAssets, groups, onUpdateGroups }: Step3GroupProps) {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const getAssetById = (id: string) => stagedAssets.find(a => a.id === id);
  
  const getGroupedAssetIds = () => {
    return new Set(groups.flatMap(g => g.assetIds));
  };

  const ungroupedAssets = stagedAssets.filter(a => !getGroupedAssetIds().has(a.id));

  const toggleAssetSelection = (id: string) => {
    setSelectedAssets(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const createGroup = () => {
    if (selectedAssets.length < 2) return;
    
    const newGroup: AssetGroup = {
      id: uuidv4(),
      name: `Asset Group ${groups.length + 1}`,
      assetIds: selectedAssets,
      isOrdered: false
    };
    
    onUpdateGroups([...groups, newGroup]);
    setSelectedAssets([]);
  };

  const deleteGroup = (groupId: string) => {
    onUpdateGroups(groups.filter(g => g.id !== groupId));
  };

  const updateGroup = (groupId: string, updates: Partial<AssetGroup>) => {
    onUpdateGroups(groups.map(g => 
      g.id === groupId ? { ...g, ...updates } : g
    ));
  };

  const removeFromGroup = (groupId: string, assetId: string) => {
    onUpdateGroups(groups.map(g => {
      if (g.id !== groupId) return g;
      const newAssetIds = g.assetIds.filter(id => id !== assetId);
      return newAssetIds.length < 2 ? null : { ...g, assetIds: newAssetIds };
    }).filter(Boolean) as AssetGroup[]);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Group Related Assets (Optional)</h3>
        <p className="text-sm text-muted-foreground">
          Combine related files into asset groups. For example, group a video file with its XML sidecar, 
          or multiple images into a storyboard.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Available Assets</h4>
            <Badge variant="outline">{ungroupedAssets.length} available</Badge>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[350px]">
                <div className="p-2 space-y-1">
                  {ungroupedAssets.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      All assets are grouped
                    </div>
                  ) : (
                    ungroupedAssets.map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => toggleAssetSelection(asset.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedAssets.includes(asset.id)
                            ? 'bg-primary/10 border border-primary'
                            : 'hover:bg-muted border border-transparent'
                        }`}
                        data-testid={`asset-select-${asset.id}`}
                      >
                        <Checkbox
                          checked={selectedAssets.includes(asset.id)}
                          onCheckedChange={() => toggleAssetSelection(asset.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-sm">{asset.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {asset.structuralType}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Button
            onClick={createGroup}
            disabled={selectedAssets.length < 2}
            className="w-full"
            data-testid="button-create-group"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Group ({selectedAssets.length} selected)
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Asset Groups</h4>
            <Badge variant="outline">{groups.length} groups</Badge>
          </div>

          <ScrollArea className="h-[420px]">
            <div className="space-y-4 pr-4">
              {groups.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No groups created yet</p>
                    <p className="text-sm">Select 2+ assets and click Create Group</p>
                  </CardContent>
                </Card>
              ) : (
                groups.map((group) => (
                  <Card key={group.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Input
                          value={group.name}
                          onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                          className="font-semibold h-8 text-base"
                          data-testid={`input-group-name-${group.id}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteGroup(group.id)}
                          className="text-destructive hover:text-destructive shrink-0 ml-2"
                          data-testid={`button-delete-group-${group.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`ordered-${group.id}`}
                          checked={group.isOrdered}
                          onCheckedChange={(checked) => updateGroup(group.id, { isOrdered: !!checked })}
                        />
                        <Label htmlFor={`ordered-${group.id}`} className="text-sm">
                          Ordered sequence (e.g., image sequence)
                        </Label>
                      </div>
                      
                      <div className="space-y-1">
                        {group.assetIds.map((assetId, index) => {
                          const asset = getAssetById(assetId);
                          if (!asset) return null;
                          return (
                            <div
                              key={assetId}
                              className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                            >
                              {group.isOrdered && (
                                <GripVertical className="h-3 w-3 text-muted-foreground" />
                              )}
                              <span className="font-mono text-xs text-muted-foreground w-4">
                                {index + 1}.
                              </span>
                              <span className="flex-1 truncate">{asset.name}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => removeFromGroup(group.id, assetId)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
