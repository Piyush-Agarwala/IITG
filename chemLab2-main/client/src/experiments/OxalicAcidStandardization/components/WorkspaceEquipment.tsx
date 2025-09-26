import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { OXALIC_ACID_EQUIPMENT, OXALIC_ACID_CHEMICALS, OXALIC_SAFETY_GUIDELINES } from "../constants";

interface WorkspaceEquipmentProps {
  onEquipmentSelect?: (equipmentId: string) => void;
  selectedEquipment?: string[];
}

export const WorkspaceEquipment: React.FC<WorkspaceEquipmentProps> = ({
  onEquipmentSelect,
  selectedEquipment = []
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Equipment Section */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Required Equipment
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Essential glassware and apparatus for preparing a standard oxalic acid solution
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OXALIC_ACID_EQUIPMENT.map((equipment: any) => (
              <div
                key={equipment.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedEquipment.includes(equipment.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onEquipmentSelect?.(equipment.id)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-shrink-0">
                    {equipment.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {equipment.name}
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {equipment.description || 'Laboratory-grade apparatus for accurate preparation'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chemicals Section */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"></div>
            Chemicals
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Reagents needed for preparing the standard solution
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {OXALIC_ACID_CHEMICALS.map((chemical: any) => (
              <div
                key={chemical.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: chemical.color }}
                  ></div>
                  <div>
                    <h4 className="font-medium text-sm">{chemical.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {chemical.formula && (
                        <span className="text-xs text-muted-foreground">
                          {chemical.formula}
                        </span>
                      )}
                      {chemical.concentration && (
                        <Badge variant="outline" className="text-xs">
                          {chemical.concentration}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {chemical.volume ? (
                    <span className="text-sm font-medium">{chemical.volume} mL</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Solid</span>
                  )}
                  {chemical.molecularWeight && (
                    <p className="text-xs text-muted-foreground">
                      MW: {chemical.molecularWeight} g/mol
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety Guidelines Section */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Safety Guidelines
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Important safety precautions for handling oxalic acid and laboratory equipment
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OXALIC_SAFETY_GUIDELINES.map((guideline: any, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                <p className="text-sm leading-relaxed">{guideline}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkspaceEquipment;
